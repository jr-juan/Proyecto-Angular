import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChoferLogica } from '../logica_componentes/chofer';

@Component({
  selector: 'app-chofer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [ChoferLogica],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['../estilos_componentes/chofer.css'],
  template: `
    <div class="chofer-contenedor">
      <div class="encabezado-chofer">
        <h2>Mi Panel de Chofer</h2>
        <p class="subtitulo">Bienvenido, {{ logica.nombreChofer }}</p>
      </div>

      <!-- Estadísticas del chofer -->
      <div class="estadisticas-chofer">
        <div class="tarjeta-stat">
          <ion-icon name="car" class="icono-stat-ion"></ion-icon>
          <div class="info-stat">
            <h3>{{ logica.vehiculosAsignados.length }}</h3>
            <p>Vehículos Asignados</p>
          </div>
        </div>

        <div class="tarjeta-stat">
          <ion-icon name="checkmark-circle" class="icono-stat-ion color-green"></ion-icon>
          <div class="info-stat">
            <h3>{{ logica.vehiculosActivos }}</h3>
            <p>Vehículos Activos</p>
          </div>
        </div>

        <!-- Espacio para futuras estadísticas de rutas -->
        <div class="tarjeta-stat tarjeta-disabled">
          <ion-icon name="map" class="icono-stat-ion"></ion-icon>
          <div class="info-stat">
            <h3>--</h3>
            <p>Rutas Asignadas (Próximamente)</p>
          </div>
        </div>
      </div>

      <!-- Mis vehículos asignados -->
      <div class="seccion-vehiculos">
        <h3>Mis Vehículos Asignados</h3>

        @if (logica.cargando) {
          <div class="loading">Cargando vehículos...</div>
        } @else if (logica.vehiculosAsignados.length > 0) {
          <div class="grid-vehiculos">
            @for (vehiculo of logica.vehiculosAsignados; track vehiculo.id) {
              <div class="tarjeta-vehiculo">
                <div class="vehiculo-header">
                  <h4>{{ vehiculo.placa }}</h4>
                  <span
                    class="badge"
                    [class.activo]="vehiculo.activo"
                    [class.inactivo]="!vehiculo.activo"
                  >
                    {{ vehiculo.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="vehiculo-detalles">
                  <p><strong>Marca:</strong> {{ vehiculo.marca }}</p>
                  <p><strong>Modelo:</strong> {{ vehiculo.modelo }}</p>
                </div>
                <!-- Espacio para futuras acciones -->
                <div class="vehiculo-acciones">
                  <button class="btn-detalle" disabled>Ver Rutas (Próximamente)</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="sin-vehiculos">
            <ion-icon name="car-outline"></ion-icon>
            <p>No tienes vehículos asignados</p>
            <p class="texto-secundario">
              Contacta al administrador para que te asigne un vehículo.
            </p>
          </div>
        }
      </div>

      @if (logica.mensajeError) {
        <div class="mensaje-error">
          {{ logica.mensajeError }}
        </div>
      }
    </div>
  `,
})
export class ChoferComponent implements OnInit {
  constructor(public logica: ChoferLogica) {}

  ngOnInit() {
    this.logica.inicializar();
  }
}
