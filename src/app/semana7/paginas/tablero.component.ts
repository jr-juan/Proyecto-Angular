import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApiService } from "../servicios/api.service";
import { Ruta, Vehiculo } from "../modelos/interfaces";

@Component({
  selector: "app-tablero",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: [`../estilos_componentes/tablero.css`],
  template: `
    <div class="tablero-contenedor">
      <h2>Tablero de Control</h2>
      <p class="subtitulo">Vista general del sistema de gestión</p>

      <!-- Tarjetas de estadísticas -->
      <div class="estadisticas">
        <div class="tarjeta-stat">
          <div class="icono-stat">🚗</div>
          <div class="info-stat">
            <h3>{{ vehiculos.length }}</h3>
            <p>Vehículos Totales</p>
          </div>
          <a routerLink="/vehiculos" class="btn-ver">Ver todos </a>
        </div>

        <div class="tarjeta-stat">
          <div class="icono-stat">🛣️</div>
          <div class="info-stat">
            <h3>{{ rutas.length }}</h3>
            <p>Rutas Registradas</p>
          </div>
          <a routerLink="/rutas" class="btn-ver">Ver todas </a>
        </div>

        <div class="tarjeta-stat">
          <div class="icono-stat">✅</div>
          <div class="info-stat">
            <h3>{{ vehiculosActivos }}</h3>
            <p>Vehículos Activos</p>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="acciones-rapidas">
        <h3>Acciones Rápidas</h3>
        <div class="botones-accion">
          <a routerLink="/vehiculos" class="btn-accion btn-primario">
            <span class="icono"></span>
            <span>Gestionar Vehículos</span>
          </a>
          <a routerLink="/rutas" class="btn-accion btn-secundario">
            <span class="icono"></span>
            <span>Gestionar Rutas</span>
          </a>
        </div>
      </div>

      <!-- Últimos vehículos -->
      @if (vehiculos.length > 0) {
        <div class="seccion-recientes">
          <h3>Últimos Vehículos Registrados</h3>
          <div class="lista-mini">
            @for (v of vehiculos.slice(0, 5); track v.id) {
              <div class="item-mini">
                <div class="item-info">
                  <strong>{{ v.placa }}</strong>
                  <span class="detalle">{{ v.marca }} {{ v.modelo }}</span>
                </div>
                <span class="badge" [class.activo]="v.activo" [class.inactivo]="!v.activo">
                  {{ v.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class TableroComponent implements OnInit {
  rutas: Ruta[] = [];
  vehiculos: Vehiculo[] = [];
  vehiculosActivos = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar rutas
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        this.rutas = res.data || res || [];
      },
      error: (err) => console.error('Error al cargar rutas:', err)
    });

    // Cargar vehículos
    this.apiService.obtenerVehiculos().subscribe({
      next: (res: any) => {
        this.vehiculos = res.data || res || [];
        this.vehiculosActivos = this.vehiculos.filter(v => v.activo).length;
      },
      error: (err) => console.error('Error al cargar vehículos:', err)
    });
  }
}