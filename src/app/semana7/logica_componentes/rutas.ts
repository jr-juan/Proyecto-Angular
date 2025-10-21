import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../servicios/api.service';
import { Ruta } from '../modelos/interfaces';

@Injectable()
export class RutasMapaLogica {
  private map: any;
  private L: any; // Leaflet se cargará dinámicamente
  private routeLayers: any[] = [];
  private resizeObserver?: ResizeObserver;
  private onWindowResize?: () => void;

  rutas: Ruta[] = [];
  loading = true;

  private containerElement: any;
  private mapElement: any;

  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setElements(containerRef: any, mapRef: any) {
    this.containerElement = containerRef;
    this.mapElement = mapRef;
  }

  inicializar() {
    this.cargarRutas(); // sospecho que el mapa se pone todo gris usando este metodo
    //this.cargarRutasDemo(); // se ve el mapa descuadrado pero al menos se ven las rutas de la demo
    // this.inicializarMapaDespuesDeVista();
  }

  inicializarMapaDespuesDeVista() {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = this.containerElement.nativeElement;
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      this.cargarLeafletEInicializarMapa();
    } else {
      this.resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          this.resizeObserver?.disconnect();
          this.cargarLeafletEInicializarMapa();
        }
      });
      this.resizeObserver.observe(container);
    }
  }

  private async cargarLeafletEInicializarMapa() {
    await this.cargarLeaflet();
    this.inicializarMapa();
  }

  private async cargarLeaflet() {
    if (!this.L) {
      this.L = await import('leaflet');
    }
  }

  private inicializarMapa() {
    if (!this.L) return;

    this.ngZone.runOutsideAngular(() => {
      // Limpiar si ya existe
      if (this.map) {
        try {
          this.map.remove();
        } catch {}
      }

      // Crear mapa usando el elemento directamente
      this.map = this.L.map(this.mapElement.nativeElement, {
        preferCanvas: true,
        zoomControl: true,
        minZoom: 3,
        maxZoom: 19,
      });

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map);

      // Configurar iconos de Leaflet
      delete (this.L.Icon.Default.prototype as any)._getIconUrl;
      this.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Asegurar que Leaflet recalcule tamaño al estar listo
      this.map.whenReady(() => this.map.invalidateSize());

      // Geolocalización (si el usuario lo permite)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
            this.L.marker([pos.coords.latitude, pos.coords.longitude])
              .addTo(this.map)
              .bindPopup('Tu ubicación actual');
            this.dibujarRutas();
            this.forzarRedraw();
          },
          () => {
            // Fallback a Buenaventura
            this.map.setView([3.8777, -77.0276], 13);
            this.dibujarRutas();
            this.forzarRedraw();
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      } else {
        this.map.setView([3.8777, -77.0276], 13);
        this.dibujarRutas();
        this.forzarRedraw();
      }

      // Observador para redimensionar correctamente
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      this.resizeObserver.observe(this.mapElement.nativeElement);

      this.onWindowResize = () => {
        if (this.map) this.map.invalidateSize();
      };
      window.addEventListener('resize', this.onWindowResize);
    });
  }

  private cargarRutas() {
    this.loading = true;
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        console.log('Respuesta de rutas:', res);
        this.rutas = res.data || res || [];
        console.log('Rutas cargadas:', this.rutas);
        this.loading = false;
        // Si el mapa ya existe, dibujar
        if (this.map) {
          this.dibujarRutas();
        }
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        this.loading = false;
      },
    });
  }

  // Demo de rutas si la API no tiene datos
  private cargarRutasDemo() {
    this.rutas = [
      {
        id: '1',
        perfil_id: this.apiService.PERFIL_ID,
        nombre_ruta: 'Ruta Bellavista',
        color_hex: '#ff0000',
        shape: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [-77.0276, 3.8777],
            [-77.03, 3.88],
          ],
        }),
      },
      {
        id: '2',
        perfil_id: this.apiService.PERFIL_ID,
        nombre_ruta: 'Ruta Juan 23',
        color_hex: '#0000ff',
        shape: JSON.stringify({
          type: 'LineString',
          coordinates: [
            [-77.0276, 3.8777],
            [-77.025, 3.875],
          ],
        }),
      },
    ];
    this.loading = false;
    if (this.map) this.dibujarRutas();
  }

  private dibujarRutas() {
    if (!this.map || !this.L) return;

    // Eliminar capas anteriores
    this.routeLayers.forEach((layer) => {
      try {
        this.map.removeLayer(layer);
      } catch {}
    });
    this.routeLayers = [];

    this.rutas.forEach((ruta) => {
      if (!ruta.shape) return;
      try {
        const geojson = JSON.parse(ruta.shape);
        const layer = this.L.geoJSON(geojson, {
          style: { color: ruta.color_hex, weight: 4, opacity: 0.85 },
        }).addTo(this.map);
        this.routeLayers.push(layer);
      } catch (e) {
        console.error('GeoJSON inválido', e);
      }
    });

    if (this.routeLayers.length) {
      const group = this.L.featureGroup(this.routeLayers);
      this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
      setTimeout(() => this.map.invalidateSize(), 200);
    }

    this.forzarRedraw();
  }

  zoomToRuta(ruta: Ruta) {
    if (!ruta.shape || !this.map || !this.L) return;
    try {
      const geojson = JSON.parse(ruta.shape);
      const layer = this.L.geoJSON(geojson);
      this.map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      this.forzarRedraw();
    } catch (e) {
      console.error(e);
    }
  }

  private forzarRedraw() {
    if (!this.map) return;
    requestAnimationFrame(() => this.map.invalidateSize());
    setTimeout(() => this.map.invalidateSize(), 120);
    setTimeout(() => this.map.invalidateSize(), 400);
  }

  limpiar() {
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
