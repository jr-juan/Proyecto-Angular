import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AsignacionesLogica } from '../logica_componentes/asignaciones';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [AsignacionesLogica],
  styleUrls: ['../estilos_componentes/asignaciones.css'],
  template: `
    <div class="asignaciones-contenedor">
      <div class="encabezado">
        <div>
          <h2>Asignación de Vehículos</h2>
          <p class="subtitulo">Gestiona qué vehículos están asignados a cada chofer</p>
        </div>
      </div>

      @if (logica.mensajeExito) {
        <div class="mensaje-exito">
          {{ logica.mensajeExito }}
          <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('exito')">✕</button>
        </div>
      }

      @if (logica.mensajeError) {
        <div class="mensaje-error">
          {{ logica.mensajeError }}
          <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('error')">✕</button>
        </div>
      }

      <!-- Filtros -->
      <div class="filtros">
        <div class="filtro-grupo">
          <label>Filtrar por chofer:</label>
          <input
            type="text"
            [(ngModel)]="logica.busquedaChofer"
            (input)="logica.filtrarChoferes()"
            placeholder="Buscar por nombre o email..."
            class="input-busqueda"
          />
        </div>
      </div>

      <!-- Lista de Choferes -->
      <div class="choferes-contenedor">
        @if (logica.cargando) {
          <div class="loading">Cargando choferes...</div>
        } @else if (logica.choferesFiltrados.length > 0) {
          <div class="grid-choferes">
            @for (chofer of logica.choferesFiltrados; track chofer.uid) {
              <div class="tarjeta-chofer">
                <div class="chofer-header">
                  <div class="chofer-info">
                    <h3>{{ chofer.nombre }} {{ chofer.apellidos }}</h3>
                    <p class="chofer-email">{{ chofer.email }}</p>
                  </div>
                  <span class="badge-rol">Chofer</span>
                </div>

                <div class="chofer-stats">
                  <div class="stat-item">
                    <span class="stat-numero">{{ logica.contarVehiculosAsignados(chofer.uid) }}</span>
                    <span class="stat-label">Vehículos Asignados</span>
                  </div>
                </div>

                <div class="vehiculos-asignados">
                  <h4>Vehículos Asignados:</h4>
                  @if (logica.obtenerVehiculosDelChofer(chofer.uid).length > 0) {
                    <div class="lista-vehiculos-mini">
                      @for (vehiculo of logica.obtenerVehiculosDelChofer(chofer.uid); track vehiculo.id) {
                        <div class="vehiculo-mini">
                          <span class="vehiculo-placa">{{ vehiculo.placa }}</span>
                          <span class="vehiculo-info">{{ vehiculo.marca }} {{ vehiculo.modelo }}</span>
                          <button 
                            class="btn-quitar"
                            (click)="logica.desasignarVehiculo(vehiculo.id!, chofer.uid)"
                            title="Quitar asignación">
                            ✕
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="sin-vehiculos">Sin vehículos asignados</p>
                  }
                </div>

                <button 
                  class="btn-asignar"
                  (click)="logica.abrirModalAsignacion(chofer)">
                  + Asignar Vehículo
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="sin-datos">
            <p>No hay choferes registrados</p>
          </div>
        }
      </div>

      <!-- Modal de Asignación -->
    @if (logica.mostrarModal) {
        <div class="modal-overlay" (click)="logica.cerrarModal()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Asignar Vehículo a {{ logica.choferSeleccionado?.nombre }}</h3>
              <button class="btn-cerrar" (click)="logica.cerrarModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="busqueda-modal">
                <input
                  type="text"
                  [(ngModel)]="logica.busquedaVehiculo"
                  (input)="logica.filtrarVehiculosDisponibles()"
                  placeholder="Buscar vehículo por placa, marca..."
                  class="input-busqueda"
                />
              </div>

              @if (logica.cargandoVehiculos) {
                <div class="loading">Cargando vehículos...</div>
              } @else if (logica.vehiculosDisponiblesFiltrados.length > 0) {
                <div class="lista-vehiculos-disponibles">
                  @for (vehiculo of logica.vehiculosDisponiblesFiltrados; track vehiculo.id) {
                    <div class="item-vehiculo-disponible">
                      <div class="vehiculo-detalle">
                        <strong>{{ vehiculo.placa }}</strong>
                        <span>{{ vehiculo.marca }} {{ vehiculo.modelo }}</span>
                        @if (vehiculo.choferAsignado) {
                          <span class="badge-asignado">Ya asignado</span>
                        }
                      </div> 
                      <button
                        class="btn-seleccionar"
                        [disabled]="vehiculo.choferAsignado !== null && vehiculo.choferAsignado !== undefined"
                        (click)="logica.asignarVehiculo(vehiculo.id!)">
                        {{ vehiculo.choferAsignado ? 'Asignado' : 'Asignar' }}
                      </button>
                    </div>
                  } 
                </div>
              } @else {
                <div class="sin-vehiculos-disponibles">
                  <p>No hay vehículos disponibles para asignar</p>
                </div>
              }  
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AsignacionesComponent implements OnInit {
  constructor(public logica: AsignacionesLogica) { }

  ngOnInit() {
    this.logica.inicializar();
  }
}