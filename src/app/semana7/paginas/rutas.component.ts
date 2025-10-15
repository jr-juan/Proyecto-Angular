import { Component, OnInit, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RutasLogica } from "../logica_componentes/rutas";

@Component({
  selector: "app-rutas",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [RutasLogica],
  styleUrls: [`../estilos_componentes/rutas.css`],
  template: `
    <div class="rutas-contenedor">
      <div class="encabezado">
        <div>
          <h2>Gestión de Rutas</h2>
          <p class="subtitulo">Crea y visualiza rutas seleccionando calles en el mapa</p>
        </div>
        <button class="btn-nuevo" (click)="logica.abrirFormularioCrear()">
          + Nueva Ruta
        </button>
      </div>

      <!-- Lista de rutas existentes -->
      <div class="lista-rutas">
        <h3>Rutas Registradas</h3>
        @if (logica.rutas.length > 0) {
          <div class="tarjetas-rutas">
            @for (r of logica.rutas; track r.id) {
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
      @if (logica.mostrarFormulario) {
        <div class="modal-overlay" (click)="logica.cerrarFormulario()">
          <div class="modal-contenido-grande" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Crear Nueva Ruta</h3>
              <button class="btn-cerrar" (click)="logica.cerrarFormulario()">✕</button>
            </div>

            <div class="formulario-mapa">
              <!-- Formulario -->
              <div class="seccion-formulario">
                <div class="campo">
                  <label>Nombre de la Ruta </label>
                  <input
                    type="text"
                    [(ngModel)]="logica.formulario.nombre_ruta"
                    placeholder="Ej: Ruta Centro - Norte"
                    class="input-texto"
                  />
                </div>

                <div class="campo">
                  <label>Calles Seleccionadas ({{ logica.callesSeleccionadas.length }})</label>
                  <div class="lista-calles-seleccionadas">
                    @if (logica.callesSeleccionadas.length > 0) {
                      @for (calle of logica.callesSeleccionadas; track calle.id) {
                        <div class="item-calle">
                          <span>{{ calle.nombre }}</span>
                          <button 
                            type="button" 
                            class="btn-quitar" 
                            (click)="logica.quitarCalle(calle)"
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

                @if (logica.mensajeError) {
                  <div class="mensaje-error">{{ logica.mensajeError }}</div>
                }

                <div class="botones-formulario">
                  <button type="button" class="btn-cancelar" (click)="logica.cerrarFormulario()">
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    class="btn-guardar" 
                    (click)="logica.guardarRuta()"
                    [disabled]="logica.cargando"
                  >
                    {{ logica.cargando ? 'Guardando...' : 'Guardar Ruta' }}
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
  constructor(public logica: RutasLogica) {}

  ngOnInit() {
    this.logica.inicializar();
  }

  ngAfterViewInit() {
    this.logica.configurarLeaflet();
  }
}