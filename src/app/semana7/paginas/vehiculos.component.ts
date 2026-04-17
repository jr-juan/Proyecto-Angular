import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VehiculosLogica } from '../logica_componentes/vehiculos';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [VehiculosLogica],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['../estilos_componentes/vehiculos.css'],
  template: `
    <div class="vehiculos-contenedor">
      <div class="encabezado">
        <div>
          <h2>Gestión de Vehículos</h2>

          <p class="subtitulo">Administra todos los vehículos del sistema</p>
        </div>

        <button class="btn-nuevo" (click)="logica.abrirFormularioCrear()">+ Nuevo Vehículo</button>
      </div>

      @if (logica.mensajeExito) {
        <div class="mensaje-exito">
          {{ logica.mensajeExito }}
          <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('exito')">✕</button>
        </div>
      }
      @if (logica.mensajeError && !logica.mostrarFormulario && !logica.mostrarConfirmacion) {
        <div class="mensaje-error">
          {{ logica.mensajeError }}
          <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('error')">✕</button>
        </div>
      }
      <div class="barra-busqueda">
        <input
          type="text"
          [(ngModel)]="logica.busqueda"
          (input)="logica.filtrarVehiculos()"
          placeholder="Buscar por placa, marca o modelo..."
          class="input-busqueda"
          name="busqueda"
        />
      </div>

      <div class="tabla-contenedor">
        @if (logica.cargando) {
          <div class="loading">Cargando vehículos...</div>
        } @else if (logica.vehiculosFiltrados.length > 0) {
          <table class="tabla-vehiculos">
            <thead>
              <tr>
                <th>Placa</th>

                <th>Marca</th>

                <th>Modelo</th>

                <th>Estado</th>

                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              @for (v of logica.vehiculosFiltrados; track v.id) {
                <tr>
                  <td>
                    <strong>{{ v.placa }}</strong>
                  </td>

                  <td>{{ v.marca }}</td>

                  <td>{{ v.modelo }}</td>

                  <td>
                    <span class="badge" [class.activo]="v.activo" [class.inactivo]="!v.activo">
                      {{ v.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>

                  <td>
                    <div class="acciones">
                      <button
                        class="btn-icono editar"
                        (click)="logica.abrirFormularioEditar(v)"
                        title="Editar"
                      >
                        <ion-icon name="create-outline"></ion-icon> Editar
                      </button>

                      <button
                        class="btn-icono eliminar"
                        (click)="logica.confirmarEliminar(v)"
                        title="Eliminar"
                      >
                        <ion-icon name="trash-outline"></ion-icon> Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="sin-datos">
            <p>No hay vehículos registrados</p>
          </div>
        }
      </div>

      @if (logica.mostrarFormulario) {
        <div class="modal-overlay" (click)="logica.cerrarFormulario()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ logica.modoEdicion ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
              <button class="btn-cerrar" (click)="logica.cerrarFormulario()">✕</button>
            </div>

            <form (ngSubmit)="logica.guardarVehiculo()" class="formulario">
              <div class="campo">
                <label>Placa *</label>
                <input
                  type="text"
                  [(ngModel)]="logica.formulario.placa"
                  name="placa"
                  placeholder="ABC-123"
                  required
                  class="input-texto"
                />
              </div>

              <div class="campo">
                <label>Marca *</label>
                <input
                  type="text"
                  [(ngModel)]="logica.formulario.marca"
                  name="marca"
                  placeholder="Toyota, Chevrolet..."
                  required
                  class="input-texto"
                />
              </div>

              <div class="campo">
                <label>Modelo *</label>
                <input
                  type="text"
                  [(ngModel)]="logica.formulario.modelo"
                  name="modelo"
                  placeholder="2023"
                  required
                  class="input-texto"
                />
              </div>

              <div class="campo-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="logica.formulario.activo"
                  name="activo"
                  id="activo"
                />
                <label for="activo">Vehículo activo</label>
              </div>

              @if (logica.mensajeError) {
                <div class="mensaje-error">{{ logica.mensajeError }}</div>
              }
              <div class="botones-formulario">
                <button
                  type="button"
                  class="btn-cancelar"
                  (click)="logica.cerrarFormulario()"
                  [disabled]="logica.cargando"
                >
                  Cancelar
                </button>

                <button type="submit" class="btn-guardar" [disabled]="logica.cargando">
                  {{ logica.cargando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      @if (logica.mostrarConfirmacion) {
        <div class="modal-overlay" (click)="logica.cerrarConfirmacion()">
          <div class="modal-confirmacion" (click)="$event.stopPropagation()">
            <h3>¿Eliminar vehículo?</h3>
            @if (logica.mensajeError) {
              <div class="mensaje-error">{{ logica.mensajeError }}</div>
            }
            <p>
              ¿Estás seguro de eliminar el vehículo con placa
              <strong>{{ logica.vehiculoAEliminar?.placa }}</strong
              >?
            </p>

            <p class="advertencia">Esta acción no se puede deshacer.</p>

            <div class="botones-confirmacion">
              <button class="btn-cancelar" (click)="logica.cerrarConfirmacion()">Cancelar</button>

              <button class="btn-eliminar-confirmar" (click)="logica.eliminarVehiculo()">
                {{ logica.cargando ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class VehiculosComponent implements OnInit {
  constructor(public logica: VehiculosLogica) {}

  ngOnInit() {
    this.logica.inicializar();
  }
}
