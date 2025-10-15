import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ApiService } from "../servicios/api.service";
import { Ruta, Calle, CrearRuta } from "../modelos/interfaces";

@Component({
  selector: "app-rutas",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: [`../estilos_componentes/rutas.css`],
  template: `
    <div class="rutas-contenedor">
      <div class="encabezado">
        <div>
          <h2>Gestión de Rutas</h2>
          <p class="subtitulo">Crea y visualiza rutas seleccionando calles en el mapa</p>
        </div>
        <button class="btn-nuevo" (click)="abrirFormularioCrear()">
          + Nueva Ruta
        </button>
      </div>

      <!-- Lista de rutas existentes -->
      <div class="lista-rutas">
        <h3>Rutas Registradas</h3>
        @if (rutas.length > 0) {
          <div class="tarjetas-rutas">
            @for (r of rutas; track r.id) {
              <div class="tarjeta-ruta">
                <div class="ruta-header">
                  <div class="color-indicador" [style.background]="r.color_hex"></div>
                  <h4>{{ r.nombre_ruta }}</h4>
                </div>
                <div class="ruta-info">
                  <p><strong>Color:</strong> {{ r.color_hex }}</p>
                  <p class="ruta-id">ID: {{ r.id }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="sin-datos">
            <p>No hay rutas registradas aún</p>
          </div>
        }
      </div>

      <!-- Modal de creación -->
      @if (mostrarFormulario) {
        <div class="modal-overlay" (click)="cerrarFormulario()">
          <div class="modal-contenido-grande" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Crear Nueva Ruta</h3>
              <button class="btn-cerrar" (click)="cerrarFormulario()">✕</button>
            </div>

            <div class="formulario-mapa">
              <!-- Formulario -->
              <div class="seccion-formulario">
                <div class="campo">
                  <label>Nombre de la Ruta </label>
                  <input
                    type="text"
                    [(ngModel)]="formulario.nombre_ruta"
                    placeholder="Ej: Ruta Centro - Norte"
                    class="input-texto"
                  />
                </div>

                <div class="campo">
                  <label>Calles Seleccionadas ({{ callesSeleccionadas.length }})</label>
                  <div class="lista-calles-seleccionadas">
                    @if (callesSeleccionadas.length > 0) {
                      @for (calle of callesSeleccionadas; track calle.id) {
                        <div class="item-calle">
                          <span>{{ calle.nombre }}</span>
                          <button 
                            type="button" 
                            class="btn-quitar" 
                            (click)="quitarCalle(calle)"
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      }
                    } @else {
                      <p class="texto-ayuda">Haz clic en las calles del mapa para seleccionarlas</p>
                    }
                  </div>
                </div>

                @if (mensajeError) {
                  <div class="mensaje-error">{{ mensajeError }}</div>
                }

                <div class="botones-formulario">
                  <button type="button" class="btn-cancelar" (click)="cerrarFormulario()">
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    class="btn-guardar" 
                    (click)="guardarRuta()"
                    [disabled]="cargando"
                  >
                    {{ cargando ? 'Guardando...' : 'Guardar Ruta' }}
                  </button>
                </div>
              </div>

              <!-- Mapa -->
              <div class="seccion-mapa">
                <div id="mapa" class="mapa-contenedor"></div>
                <div class="leyenda-mapa">
                  <p><strong>Instrucciones:</strong></p>
                  <ul>
                    <li>Haz clic en las calles para seleccionarlas</li>
                    <li>Las calles seleccionadas se resaltan en azul</li>
                    <li>Puedes quitar calles desde la lista</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RutasComponent implements OnInit, AfterViewInit {
  rutas: Ruta[] = [];
  calles: Calle[] = [];
  callesSeleccionadas: Calle[] = [];
  
  mostrarFormulario = false;
  cargando = false;
  mensajeError = "";
  
  formulario = {
    nombre_ruta: ""
  };

  mapa: any;
  capasCalles: Map<string, any> = new Map();
  L: any; // Leaflet se cargará dinámicamente

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.cargarRutas();
    this.cargarCalles();
  }

  ngAfterViewInit() {
  // Configurar las rutas de los iconos de Leaflet
  if (isPlatformBrowser(this.platformId)) {
    setTimeout(async () => {
      await this.cargarLeaflet();
      if (this.L) {
        delete (this.L.Icon.Default.prototype as any)._getIconUrl;
        this.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }
    }, 0);
  }
}

  cargarRutas() {
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        this.rutas = res.data || res || [];
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
      }
    });
  }

  cargarCalles() {
    this.apiService.obtenerCalles().subscribe({
      next: (res: any) => {
        this.calles = res.data || res || [];
      },
      error: (err) => {
        console.error('Error al cargar calles:', err);
      }
    });
  }

  abrirFormularioCrear() {
    this.formulario = { nombre_ruta: "" };
    this.callesSeleccionadas = [];
    this.mensajeError = "";
    this.mostrarFormulario = true;
    
    // Solo inicializar el mapa en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(async () => {
        await this.cargarLeaflet();
        this.inicializarMapa();
      }, 100);
    }
  }

  async cargarLeaflet() {
    if (!this.L) {
      this.L = await import('leaflet');
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
    this.capasCalles.clear();
  }

  inicializarMapa() {
    if (this.mapa) {
      this.mapa.remove();
    }

    if (!this.L) return;

    // Coordenadas de Buenaventura, Colombia
    this.mapa = this.L.map('mapa').setView([3.8801, -77.0312], 13);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);

    // Agregar calles al mapa
    this.calles.forEach(calle => {
      try {
        const geojson = JSON.parse(calle.shape);
        const capa = this.L.geoJSON(geojson, {
          style: {
            color: '#95a5a6',
            weight: 4,
            opacity: 0.7
          }
        }).addTo(this.mapa);

        capa.on('click', () => {
          this.toggleCalle(calle);
        });

        this.capasCalles.set(calle.id, capa);
      } catch (e) {
        console.warn(`No se pudo parsear la geometría de la calle ${calle.nombre}`);
      }
    });
  }

  toggleCalle(calle: Calle) {
    const index = this.callesSeleccionadas.findIndex(c => c.id === calle.id);
    const capa = this.capasCalles.get(calle.id);

    if (index > -1) {
      // Quitar selección
      this.callesSeleccionadas.splice(index, 1);
      if (capa) {
        capa.setStyle({ color: '#95a5a6', weight: 4 });
      }
    } else {
      // Agregar selección
      this.callesSeleccionadas.push(calle);
      if (capa) {
        capa.setStyle({ color: '#3498db', weight: 6 });
      }
    }
  }

  quitarCalle(calle: Calle) {
    const index = this.callesSeleccionadas.findIndex(c => c.id === calle.id);
    if (index > -1) {
      this.callesSeleccionadas.splice(index, 1);
      const capa = this.capasCalles.get(calle.id);
      if (capa) {
        capa.setStyle({ color: '#95a5a6', weight: 4 });
      }
    }
  }

  guardarRuta() {
    if (!this.formulario.nombre_ruta.trim()) {
      this.mensajeError = 'El nombre de la ruta es obligatorio';
      return;
    }

    if (this.callesSeleccionadas.length === 0) {
      this.mensajeError = 'Debes seleccionar al menos una calle';
      return;
    }

    this.cargando = true;
    this.mensajeError = "";

    const nuevaRuta: CrearRuta = {
      nombre_ruta: this.formulario.nombre_ruta,
      calles: this.callesSeleccionadas.map(c => c.id),
      perfil_id: this.apiService.PERFIL_ID
    };

    this.apiService.crearRuta(nuevaRuta).subscribe({
      next: () => {
        this.cargando = false;
        this.cerrarFormulario();
        this.cargarRutas();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.message || 'Error al crear la ruta';
      }
    });
  }
}