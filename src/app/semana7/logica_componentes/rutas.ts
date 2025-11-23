import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../servicios/api.service';
import { ElementRef } from '@angular/core';
import { Ruta, Calle } from '../modelos/interfaces';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RutasMapaLogica {
  private readonly MAPBOX_TOKEN = environment.mapboxToken;

  // Propiedades del mapa
  private map?: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private currentLine: GeoJSON.Feature<GeoJSON.LineString> | null = null;
  private puntosDibujados: [number, number][] = [];

  // Estados públicos
  public rutas: Ruta[] = [];
  public calles: Calle[] = [];
  public loading = true;
  public saving = false;
  public dibujandoRuta = false;

  // Formulario
  public newRutaName = '';
  public newRutaColor = '#ff0000';

  // Referencias DOM
  private mapElement!: HTMLElement;
  private isBrowser = false;

  // Mensajes
  mensajeExito = '';
  mensajeError = '';

  private colorAnterior = '#ff0000';

  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Configurar token de Mapbox
    if (this.isBrowser) {
      mapboxgl.accessToken = this.MAPBOX_TOKEN;
    }
  }

  /**
   * Establece el elemento DOM donde se renderizará el mapa
   */
  setMapElement(mapRef: ElementRef<HTMLDivElement>) {
    this.mapElement = mapRef.nativeElement;
  }

  /**
   * Inicializa el mapa
   */
  public async inicializar() {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    // esto para desactivar telemetría
    (mapboxgl as any).prewarm();

    this.ngZone.runOutsideAngular(() => {
      try {
        this.map = new mapboxgl.Map({
          container: this.mapElement,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-77.0312, 3.8801],
          zoom: 13,
          attributionControl: false,
          collectResourceTiming: false, // Desactiva telemetría
          trackResize: false, // Mejora rendimiento en algunos casos
          fadeDuration: 0, // Desactiva animaciones de fundido
          crossSourceCollisions: false, // Mejora rendimiento al evitar colisiones entre fuentes
        });

        // Desactivar eventos de telemetría
        this.map.on('load', () => {
          // Remover event listeners de telemetría
          (this.map as any)._collectResourceTiming = false;

          this.ngZone.run(() => {
            this.loading = false;
            this.cargarRutas();
            this.cargarCalles();
          });
        });

        // Agregar controles de navegación (zoom +/-)
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Agregar control de geolocalización
        this.map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        );

        // Cuando el mapa esté listo
        this.map.on('load', () => {
          this.ngZone.run(() => {
            this.loading = false;
            this.cargarRutas();
            this.cargarCalles();
          });
        });

        // Click en el mapa para dibujar rutas
        this.map.on('click', (e) => {
          if (this.dibujandoRuta) {
            this.agregarPuntoARuta(e.lngLat.lng, e.lngLat.lat);
          }
        });
      } catch (error) {
        this.ngZone.run(() => {
          console.error('Error inicializando Mapbox:', error);
          this.loading = false;
        });
      }
    });
  }

  // ==================== DIBUJAR RUTAS ====================

  /**
   * Inicia el modo de dibujo de ruta
   */
  public iniciarDibujoRuta() {
    this.dibujandoRuta = true;
    this.puntosDibujados = [];
    this.limpiarMarcadores();
    this.newRutaName = '';
    this.newRutaColor = '#ff0000';
  }

  /**
   * Agrega un punto a la ruta que se está dibujando
   */
  private agregarPuntoARuta(lng: number, lat: number) {
    if (!this.map) return;

    // Agregar punto al array
    this.puntosDibujados.push([lng, lat]);

    // Crear marcador visual
    const marker = new mapboxgl.Marker({ color: this.newRutaColor })
      .setLngLat([lng, lat])
      .addTo(this.map);

    this.markers.push(marker);

    // Si hay al menos 2 puntos, dibujar la línea
    if (this.puntosDibujados.length >= 2) {
      this.dibujarLineaTemporal();
    }
  }

  /**
   * Dibuja la línea temporal mientras se está creando la ruta
   */
  private dibujarLineaTemporal() {
    if (!this.map) return;

    const sourceId = 'ruta-temporal';
    const layerId = 'ruta-temporal-layer';

    // Remover capa y fuente anterior si existe
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }
    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId);
    }

    // Crear GeoJSON de la línea
    const lineGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: this.puntosDibujados,
      },
    };

    // Agregar fuente y capa
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: lineGeoJSON,
    });

    this.map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': this.newRutaColor,
        'line-width': 4,
      },
    });

    this.currentLine = lineGeoJSON;
  }

  /**
   * Cancela el dibujo actual
   */
  public cancelarDibujo() {
    this.dibujandoRuta = false;
    this.puntosDibujados = [];
    this.currentLine = null;
    this.limpiarMarcadores();

    // Remover capa temporal
    if (this.map) {
      const sourceId = 'ruta-temporal';
      const layerId = 'ruta-temporal-layer';

      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    }
  }

  // Método para actualizar color de elementos ya dibujados
  public actualizarColorDibujo() {
    if (!this.dibujandoRuta) return;

    // Actualizar color de marcadores existentes
    this.markers.forEach((marker) => {
      // Recrear el marcador con el nuevo color
      const lngLat = marker.getLngLat();
      marker.remove();

      const nuevoMarker = new mapboxgl.Marker({ color: this.newRutaColor })
        .setLngLat(lngLat)
        .addTo(this.map!);

      // Actualizar en el array
      const index = this.markers.indexOf(marker);
      this.markers[index] = nuevoMarker;
    });

    // Redibujar línea temporal con nuevo color
    if (this.puntosDibujados.length >= 2) {
      this.dibujarLineaTemporal();
    }
  }

  // Método para limpiar mensajes
  limpiarMensaje(tipo: 'error' | 'exito' | 'ninguno' = 'ninguno') {
    if (tipo === 'error' || tipo === 'ninguno') this.mensajeError = '';
    if (tipo === 'exito' || tipo === 'ninguno') this.mensajeExito = '';
  }

  /**
   * Guarda la ruta dibujada
   */

  public guardarRuta() {
    this.limpiarMensaje();

    if (!this.currentLine || this.puntosDibujados.length < 2) {
      this.mensajeError = 'Debes dibujar al menos 2 puntos para crear una ruta';
      return;
    }

    if (!this.newRutaName.trim()) {
      this.mensajeError = 'Debes dar un nombre a la ruta';
      return;
    }

    this.saving = true;

    const nuevaRuta: Ruta = {
      id: '',
      perfil_id: this.apiService.PERFIL_ID,
      nombre_ruta: this.newRutaName,
      color_hex: this.newRutaColor,
      shape: JSON.stringify(this.currentLine.geometry),
    };

    this.apiService.crearRuta(nuevaRuta).subscribe({
      next: (res) => {
        this.mensajeExito = `Ruta "${this.newRutaName}" guardada exitosamente ✓`;
        this.saving = false;
        this.cancelarDibujo();
        this.cargarRutas();

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.limpiarMensaje('exito'), 5000);
      },
      error: (err) => {
        this.mensajeError = 'Error al guardar la ruta. Intenta de nuevo.';
        this.saving = false;
        console.error('Error guardando ruta:', err);
      },
    });
  }
  /**
   * Limpia los marcadores del mapa
   */
  private limpiarMarcadores() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  // ==================== CARGAR DATOS ====================

  /**
   * Carga las rutas desde la API y las dibuja
   */
  private cargarRutas() {
    this.loading = true;
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        this.rutas = res.data || res || [];
        this.dibujarRutasGuardadas();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando rutas:', err);
        this.loading = false;
      },
    });
  }

  /**
   * Dibuja todas las rutas guardadas en el mapa
   */
  private dibujarRutasGuardadas() {
    if (!this.map) return;

    this.rutas.forEach((ruta) => {
      // ✅ Validar que shape exista antes de parsear
      if (!ruta.shape) {
        console.warn('Ruta sin geometría:', ruta.nombre_ruta);
        return;
      }

      try {
        const geometry = JSON.parse(ruta.shape); // Ahora TypeScript sabe que no es undefined
        const sourceId = `ruta-${ruta.id}`;
        const layerId = `ruta-layer-${ruta.id}`;

        // Verificar si ya existe la fuente
        if (this.map!.getSource(sourceId)) {
          return;
        }

        this.map!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { nombre: ruta.nombre_ruta },
            geometry: geometry,
          },
        });

        this.map!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': ruta.color_hex || '#ff0000',
            'line-width': 4,
          },
        });

        // Agregar popup al hacer click
        this.map!.on('click', layerId, () => {
          new mapboxgl.Popup()
            .setLngLat(geometry.coordinates[0])
            .setHTML(`<strong>${ruta.nombre_ruta}</strong>`)
            .addTo(this.map!);
        });

        // Cambiar cursor
        this.map!.on('mouseenter', layerId, () => {
          this.map!.getCanvas().style.cursor = 'pointer';
        });

        this.map!.on('mouseleave', layerId, () => {
          this.map!.getCanvas().style.cursor = '';
        });
      } catch (e) {
        console.error('Error dibujando ruta:', ruta.nombre_ruta, e);
      }
    });
  }

  /**
   * Carga las calles desde la API
   */
  private cargarCalles() {
    this.apiService.obtenerCalles().subscribe({
      next: (res: any) => {
        this.calles = res.data || [];
        this.dibujarCalles();
      },
      error: (err) => {
        console.error('Error cargando calles:', err);
      },
    });
  }

  /**
   * Dibuja las calles en el mapa
   */
  private dibujarCalles() {
    if (!this.map) return;

    this.calles.forEach((calle, index) => {
      try {
        const geometry = JSON.parse(calle.shape);
        const sourceId = `calle-${calle.id}`;
        const layerId = `calle-layer-${calle.id}`;

        if (this.map!.getSource(sourceId)) {
          return;
        }

        this.map!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { nombre: calle.nombre },
            geometry: geometry,
          },
        });

        this.map!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#999',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      } catch (e) {
        console.error('Error dibujando calle:', e);
      }
    });
  }

  /**
   * Hace zoom a una ruta específica
   */
  public zoomToRuta(ruta: Ruta) {
    if (!this.map || !ruta.shape) {
      console.warn('No se puede hacer zoom: mapa no inicializado o ruta sin geometría');
      return;
    }

    try {
      const geometry = JSON.parse(ruta.shape);
      const coordinates = geometry.coordinates;

      // Crear bounds para la ruta
      const bounds = coordinates.reduce(
        (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord as [number, number]);
        },
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      this.map.fitBounds(bounds, { padding: 50 });
    } catch (e) {
      console.error('Error haciendo zoom a ruta:', e);
    }
  }

  public confirmarEliminarRuta(ruta: Ruta) {
    // Si la ruta no tiene ID, cancelamos todo para evitar el error.
    if (!ruta.id) {
      console.error('Error: Intentando eliminar una ruta sin ID');
      this.mensajeError = 'No se puede eliminar la ruta (ID no válido).';
      return;
    }

    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar la ruta "${ruta.nombre_ruta}"?`);

    if (confirmacion) {
      this.loading = true;

      this.apiService.eliminarRuta(ruta.id).subscribe({
        next: () => {
          this.mensajeExito = `Ruta "${ruta.nombre_ruta}" eliminada correctamente.`;
          this.loading = false;
          this.cargarRutas();
          this.limpiarMarcadores();

          // Limpiar el mensaje de éxito después de 3 segundos
          setTimeout(() => this.limpiarMensaje('exito'), 3000);
        },
        error: (err) => {
          console.error('Error eliminando ruta:', err);
          this.mensajeError = 'No se pudo eliminar la ruta.';
          this.loading = false;
        }
      });
    }
  }
  /**
   * Limpia el mapa al destruir el componente
   */
  public limpiar() {
    if (this.map) {
      this.limpiarMarcadores();
      this.map.remove();
    }
  }
}
