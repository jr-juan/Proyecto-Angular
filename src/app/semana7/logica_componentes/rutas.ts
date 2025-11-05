import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../servicios/api.service';
import { ElementRef } from '@angular/core';
import { Ruta, Calle } from '../modelos/interfaces';

interface RespuestaAPI<T> {
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class RutasMapaLogica {
  // Propiedades privadas del mapa
  private map: any;
  private L: any; // Referencia a Leaflet
  private drawnItems: any;
  private drawControl?: any;
  private lastDrawnLayer?: any;
  private resizeObserver?: ResizeObserver;
  private onWindowResize?: () => void;

  // Estados públicos para el componente
  public lastGeo?: GeoJSON.Geometry;
  public rutas: Ruta[] = [];
  public calles: Calle[] = [];
  public loading = true;
  public saving = false;

  // Formulario de la ruta
  public newRutaName = '';
  public newRutaColor = '#ff0000';

  // Referencias a elementos DOM
  private mapElement!: HTMLElement;
  private routeLayers: any[] = [];
  private calleLayers: any[] = [];
  private isBrowser = false;

  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Establece el elemento DOM donde se renderizará el mapa.
   */
  setMapElement(mapRef: ElementRef<HTMLDivElement>) {
    this.mapElement = mapRef.nativeElement;
  }

  /**
   * Inicializa el mapa y los datos si estamos en el navegador.
   */
  public async inicializar() {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    // Importar Leaflet dinámicamente
    try {
      this.L = (await import('leaflet')).default;
      await import('leaflet-draw');
    } catch (error) {
      console.error('Error cargando Leaflet:', error);
      this.loading = false;
      return;
    }

    const container = this.mapElement;
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      this.inicializarMapa();
    } else {
      this.resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          this.resizeObserver?.disconnect();
          this.inicializarMapa();
        }
      });
      this.resizeObserver.observe(container);
    }
  }

  /**
   * Realiza la inicialización real de Leaflet y carga los datos.
   */
  private inicializarMapa() {
    this.ngZone.runOutsideAngular(() => {
      // Limpiar si ya existe
      if (this.map) {
        try {
          this.map.remove();
        } catch {}
      }

      this.map = this.L.map(this.mapElement, {
        preferCanvas: true,
        zoomControl: true,
        minZoom: 3,
        maxZoom: 19,
      });

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      // FeatureGroup para elementos dibujados por el usuario
      this.drawnItems = new this.L.FeatureGroup().addTo(this.map);

      // Control de dibujo (leaflet-draw)
      this.setupDrawControls();

      this.map.whenReady(() => this.map.invalidateSize());

      // Cargar datos
      this.cargarRutasDesdeServicio();
      this.cargarCalles();

      // Geolocalización
      this.configurarUbicacionInicial();

      // Configurar redimensionamiento
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      this.resizeObserver.observe(this.mapElement);

      this.onWindowResize = () => {
        if (this.map) this.map.invalidateSize();
      };
      window.addEventListener('resize', this.onWindowResize);
    });
  }

  /**
   * Configura los controles de dibujo y sus eventos.
   */
  private setupDrawControls() {
    const drawOptions = {
      draw: {
        polyline: { shapeOptions: { color: this.newRutaColor, weight: 4 } },
        polygon: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: this.drawnItems, remove: true },
    };

    this.drawControl = new (this.L.Control as any).Draw(drawOptions);
    this.map.addControl(this.drawControl);

    // Eventos draw:created
    this.map.on('draw:created', (e: any) => {
      this.ngZone.run(() => {
        const layer = e.layer;
        // Eliminar dibujo previo si existe
        if (this.lastDrawnLayer) {
          try {
            this.drawnItems.removeLayer(this.lastDrawnLayer);
          } catch {}
        }
        this.drawnItems.addLayer(layer);
        this.lastDrawnLayer = layer;
        const geo = layer.toGeoJSON().geometry;
        this.lastGeo = geo;
      });
    });

    // Eventos draw:deleted
    this.map.on('draw:deleted', (e: any) => {
      this.ngZone.run(() => {
        this.lastDrawnLayer = undefined;
        this.lastGeo = undefined;
      });
    });
  }

  private configurarUbicacionInicial() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          this.L.marker([pos.coords.latitude, pos.coords.longitude])
            .addTo(this.map)
            .bindPopup('Tu ubicación actual');
          this.dibujarRutas();
          this.dibujarCalles();
          this.forzarRedraw();
        },
        () => {
          this.map.setView([3.8777, -77.0276], 13);
          this.dibujarRutas();
          this.dibujarCalles();
          this.forzarRedraw();
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      this.map.setView([3.8777, -77.0276], 13);
      this.dibujarRutas();
      this.dibujarCalles();
      this.forzarRedraw();
    }
  }

  // ==================== LÓGICA DE DATOS ====================

  private cargarRutasDesdeServicio() {
    this.loading = true;
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.rutas = (res.data || res || []).map((r: any) => {
            let color = r.color_hex;

            // Si backend no devuelve color, buscar en localStorage
            if (!color && this.isBrowser) {
              const key = `ruta-color-${r.nombre_ruta}`;
              color = localStorage.getItem(key) || '#ff0000';
            }

            return { ...r, color_hex: color || '#ff0000' };
          }) as Ruta[];

          this.loading = false;
          if (this.map) this.dibujarRutas();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error al cargar rutas:', err);
          this.loading = false;
        });
      },
    });
  }

  private cargarCalles() {
    this.apiService.obtenerCalles().subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.calles = res.data || [];
          if (this.map) this.dibujarCalles();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error al cargar calles:', err);
        });
      },
    });
  }

  /**
   * Guarda la ruta trazada por el usuario.
   */
  public saveDrawnRuta() {
    if (!this.lastGeo) return;

    this.ngZone.run(() => {
      const payload: Ruta = {
        id: '',
        perfil_id: this.apiService.PERFIL_ID,
        nombre_ruta: this.newRutaName || 'Ruta sin nombre',
        color_hex: this.colorOrDefault(this.newRutaColor),
        shape: JSON.stringify(this.lastGeo),
      };

      console.log('Payload a enviar:', payload);

      this.saving = true;
      this.apiService.crearRuta(payload).subscribe({
        next: (saved: any) => {
          this.saving = false;
          const added = saved || {};
          const finalRuta: Ruta = {
            id: added.id || Date.now().toString(),
            perfil_id: added.perfil_id || payload.perfil_id,
            nombre_ruta: added.nombre_ruta || payload.nombre_ruta,
            color_hex: payload.color_hex,
            shape:
              typeof added.shape === 'string'
                ? added.shape
                : JSON.stringify(added.shape || payload.shape),
          };

          // Guardar color en localStorage
          if (this.isBrowser) {
            const key = `ruta-color-${finalRuta.nombre_ruta}`;
            localStorage.setItem(key, payload.color_hex ?? '#ff0000');
          }

          this.rutas.push(finalRuta);
          this.dibujarRutas();
          this.clearDraw();
        },
        error: (err) => {
          this.saving = false;
          console.error('Error guardando ruta:', err);
        },
      });
    });
  }

  /**
   * Limpia el trazado actual y reinicia el formulario.
   */
  public clearDraw() {
    this.ngZone.run(() => {
      if (this.lastDrawnLayer && this.drawnItems) {
        try {
          this.drawnItems.removeLayer(this.lastDrawnLayer);
        } catch {}
      }
      this.lastDrawnLayer = undefined;
      this.lastGeo = undefined;
      this.newRutaName = '';
    });
  }

  public cancelDraw() {
    this.clearDraw();
  }

  // ==================== LÓGICA DE DIBUJO ====================

  private dibujarRutas() {
    if (!this.map || !this.L) return;

    this.routeLayers.forEach((l) => {
      try {
        this.map.removeLayer(l);
      } catch {}
    });
    this.routeLayers = [];

    this.rutas.forEach((r) => {
      if (!r.shape) return;
      try {
        const geoObj = this.parseShape(r.shape);
        if (!geoObj) {
          console.warn('dibujarRutas: shape no parseable para ruta', r.id, r.shape);
          return;
        }

        let featureToRender: any;
        if (geoObj.type === 'Feature' || geoObj.type === 'FeatureCollection') {
          featureToRender = geoObj;
        } else if (geoObj.type && geoObj.coordinates) {
          featureToRender = { type: 'Feature', properties: {}, geometry: geoObj };
        } else {
          console.warn('dibujarRutas: GeoJSON con formato inesperado', r.id, geoObj);
          return;
        }

        const color = this.colorOrDefault(r.color_hex || '#ff0000');
        const layer = this.L.geoJSON(featureToRender, {
          style: { color, weight: 4, opacity: 0.85 },
        }).addTo(this.map);

        this.routeLayers.push(layer);
      } catch (e) {
        console.error('GeoJSON inválido en ruta', r.id, e, 'raw shape:', r.shape);
      }
    });

    const allLayers = this.routeLayers.concat(this.calleLayers);
    if (allLayers.length) {
      const group = this.L.featureGroup(allLayers);
      try {
        if (group.getBounds().isValid()) {
          this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      } catch (e) {
        console.warn('fitBounds falló', e);
      }
      setTimeout(() => this.map.invalidateSize(), 200);
    }
    this.forzarRedraw();
  }

  private dibujarCalles() {
    if (!this.map || !this.L) return;

    this.calleLayers.forEach((l) => {
      try {
        this.map.removeLayer(l);
      } catch {}
    });
    this.calleLayers = [];

    this.calles.forEach((c) => {
      if (!c.shape) return;
      try {
        const geo = JSON.parse(c.shape);
        const layer = this.L.geoJSON(geo, {
          style: { color: '#666', weight: 2, opacity: 0.6, dashArray: '4 6' },
        }).addTo(this.map);
        this.calleLayers.push(layer);
      } catch (e) {
        console.error('GeoJSON inválido en calle', c.id, e);
      }
    });
  }

  public zoomToRuta(ruta: Ruta) {
    if (!ruta.shape || !this.map || !this.L) return;

    try {
      const geoObj = this.parseShape(ruta.shape);
      if (!geoObj) {
        console.warn('zoomToRuta: shape no parseable', ruta.id, ruta.shape);
        return;
      }

      let featureToZoom: any;
      if (geoObj.type === 'Feature' || geoObj.type === 'FeatureCollection') {
        featureToZoom = geoObj;
      } else if (geoObj.type && geoObj.coordinates) {
        featureToZoom = { type: 'Feature', properties: {}, geometry: geoObj };
      } else {
        console.warn('zoomToRuta: formato GeoJSON inesperado', ruta.id, geoObj);
        return;
      }

      const layer = this.L.geoJSON(featureToZoom);
      const bounds = (layer as any).getBounds();
      if (!bounds || !bounds.isValid()) {
        console.warn('zoomToRuta: bounds inválidos para ruta', ruta.id);
        return;
      }
      this.map.fitBounds(bounds, { padding: [20, 20] });
      this.forzarRedraw();
    } catch (e) {
      console.error('Error haciendo zoom a ruta', e, 'raw shape:', ruta.shape);
    }
  }

  public zoomToCalle(calle: Calle) {
    if (!calle.shape || !this.map || !this.L) return;

    try {
      const geo = JSON.parse(calle.shape);
      const layer = this.L.geoJSON(geo);
      this.map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      this.forzarRedraw();
    } catch (e) {
      console.error(e);
    }
  }

  // ==================== HELPERS ====================

  private parseShape(shape?: string | null): any | null {
    if (!shape) return null;
    try {
      let obj: any = shape;
      if (typeof obj === 'string') {
        obj = JSON.parse(obj);
        if (typeof obj === 'string') {
          obj = JSON.parse(obj);
        }
      }
      if (obj && typeof obj === 'object' && obj.type) {
        return obj;
      }
      return null;
    } catch (e) {
      console.warn('parseShape: error parsing shape', e, 'raw:', shape);
      return null;
    }
  }

  private colorOrDefault(c?: string): string {
    return c && /^#[0-9A-Fa-f]{6}$/.test(c) ? c : '#ff0000';
  }

  private forzarRedraw() {
    if (!this.map || !this.isBrowser) return;

    requestAnimationFrame(() => this.map.invalidateSize());
    setTimeout(() => this.map.invalidateSize(), 120);
    setTimeout(() => this.map.invalidateSize(), 400);
  }

  /**
   * Limpia y destruye el mapa y los observadores al destruir el componente.
   */
  public limpiar() {
    if (!this.isBrowser) return;

    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    this.resizeObserver?.disconnect();
    if (this.map) {
      try {
        this.map.remove();
      } catch {}
    }
  }
}