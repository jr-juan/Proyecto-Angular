import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../servicios/api.service';
import { Vehiculo, CrearVehiculo, ActualizarVehiculo } from '../modelos/interfaces';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: [`../estilos_componentes/vehiculos.css`],
  template: `
    <div class="vehiculos-contenedor">
      <div class="encabezado">
        <div>
          <h2>Gestión de Vehículos</h2>
          <p class="subtitulo">Administra todos los vehículos del sistema</p>
        </div>
        <button class="btn-nuevo" (click)="abrirFormularioCrear()">+ Nuevo Vehículo</button>
      </div>

      <!-- Buscador -->
      <div class="barra-busqueda">
        <input
          type="text"
          [(ngModel)]="busqueda"
          (input)="filtrarVehiculos()"
          placeholder="Buscar por placa, marca o modelo..."
          class="input-busqueda"
        />
      </div>

      <!-- Tabla de vehículos -->
      <div class="tabla-contenedor">
        @if (vehiculosFiltrados.length > 0) {
        <table class="tabla-vehiculos">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Capacidad</th>
              <th>Combustible</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (v of vehiculosFiltrados; track v.id) {
            <tr>
              <td>
                <strong>{{ v.placa }}</strong>
              </td>
              <td>{{ v.marca }}</td>
              <td>{{ v.modelo }}</td>
              <td>{{ v.capacidad }} pasajeros</td>
              <td>{{ v.tipo_combustible }}</td>
              <td>
                <span class="badge" [class.activo]="v.activo" [class.inactivo]="!v.activo">
                  {{ v.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button
                    class="btn-icono editar"
                    (click)="abrirFormularioEditar(v)"
                    title="Editar">✏️
                  </button>
                  <button
                    class="btn-icono eliminar"
                    (click)="confirmarEliminar(v)"
                    title="Eliminar">🗑️
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

      <!-- Modal de formulario -->
      @if (mostrarFormulario) {
      <div class="modal-overlay" (click)="cerrarFormulario()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modoEdicion ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
            <button class="btn-cerrar" (click)="cerrarFormulario()">✕</button>
          </div>

          <form (ngSubmit)="guardarVehiculo()" class="formulario">
            <div class="campo">
              <label>Placa *</label>
              <input
                type="text"
                [(ngModel)]="formulario.placa"
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
                [(ngModel)]="formulario.marca"
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
                [(ngModel)]="formulario.modelo"
                name="modelo"
                placeholder="2023"
                required
                class="input-texto"
              />
            </div>

            <div class="campo">
              <label>Capacidad *</label>
              <input
                type="number"
                [(ngModel)]="formulario.capacidad"
                name="capacidad"
                placeholder="45"
                min="1"
                required
                class="input-texto"
              />
            </div>

            <div class="campo">
              <label>Tipo de Combustible *</label>
              <select
                [(ngModel)]="formulario.tipo_combustible"
                name="combustible"
                required
                class="input-select"
              >
                <option value="">Seleccione...</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diésel</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Híbrido">Híbrido</option>
                <option value="GNV">GNV</option>
              </select>
            </div>

            <div class="campo-checkbox">
              <input type="checkbox" [(ngModel)]="formulario.activo" name="activo" id="activo" />
              <label for="activo">Vehículo activo</label>
            </div>

            @if (mensajeError) {
            <div class="mensaje-error">{{ mensajeError }}</div>
            }

            <div class="botones-formulario">
              <button type="button" class="btn-cancelar" (click)="cerrarFormulario()">
                Cancelar
              </button>
              <button type="submit" class="btn-guardar" [disabled]="cargando">
                {{ cargando ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      }

      <!-- Modal de confirmación de eliminación -->
      @if (mostrarConfirmacion) {
      <div class="modal-overlay" (click)="cerrarConfirmacion()">
        <div class="modal-confirmacion" (click)="$event.stopPropagation()">
          <h3>¿Eliminar vehículo?</h3>
          <p>
            ¿Estás seguro de eliminar el vehículo con placa
            <strong>{{ vehiculoAEliminar?.placa }}</strong
            >?
          </p>
          <p class="advertencia">Esta acción no se puede deshacer.</p>
          <div class="botones-confirmacion">
            <button class="btn-cancelar" (click)="cerrarConfirmacion()">Cancelar</button>
            <button class="btn-eliminar-confirmar" (click)="eliminarVehiculo()">Eliminar</button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
})
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];
  vehiculosFiltrados: Vehiculo[] = [];
  busqueda = '';

  mostrarFormulario = false;
  modoEdicion = false;
  vehiculoEditando: Vehiculo | null = null;

  mostrarConfirmacion = false;
  vehiculoAEliminar: Vehiculo | null = null;

  cargando = false;
  mensajeError = '';

  formulario = {
    placa: '',
    marca: '',
    modelo: '',
    capacidad: 0,
    tipo_combustible: '',
    activo: true,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.apiService.obtenerVehiculos().subscribe({
      next: (res: any) => {
        this.vehiculos = res.data || res || [];
        this.vehiculosFiltrados = this.vehiculos;
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.mensajeError = 'Error al cargar los vehículos';
      },
    });
  }

  filtrarVehiculos() {
    if (!this.busqueda) {
      this.vehiculosFiltrados = this.vehiculos;
    } else {
      const busquedaLower = this.busqueda.toLowerCase();
      this.vehiculosFiltrados = this.vehiculos.filter(
        (v) =>
          v.placa.toLowerCase().includes(busquedaLower) ||
          v.marca.toLowerCase().includes(busquedaLower) ||
          v.modelo.toLowerCase().includes(busquedaLower)
      );
    }
  }

  abrirFormularioCrear() {
    this.modoEdicion = false;
    this.vehiculoEditando = null;
    this.formulario = {
      placa: '',
      marca: '',
      modelo: '',
      capacidad: 0,
      tipo_combustible: '',
      activo: true,
    };
    this.mensajeError = '';
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(vehiculo: Vehiculo) {
    this.modoEdicion = true;
    this.vehiculoEditando = vehiculo;
    this.formulario = {
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      capacidad: vehiculo.capacidad,
      tipo_combustible: vehiculo.tipo_combustible,
      activo: vehiculo.activo,
    };
    this.mensajeError = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.mensajeError = '';
  }

  guardarVehiculo() {
    if (
      !this.formulario.placa ||
      !this.formulario.marca ||
      !this.formulario.modelo ||
      !this.formulario.capacidad ||
      !this.formulario.tipo_combustible
    ) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    if (this.modoEdicion && this.vehiculoEditando) {
      // Actualizar
      const datos: ActualizarVehiculo = {
        placa: this.formulario.placa,
        marca: this.formulario.marca,
        modelo: this.formulario.modelo,
        capacidad: this.formulario.capacidad,
        tipo_combustible: this.formulario.tipo_combustible,
        activo: this.formulario.activo,
      };

      this.apiService.actualizarVehiculo(this.vehiculoEditando.id, datos).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarFormulario();
          this.cargarVehiculos();
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.message || 'Error al actualizar el vehículo';
        },
      });
    } else {
      // Crear
      const nuevoVehiculo: CrearVehiculo = {
        ...this.formulario,
        perfil_id: this.apiService.PERFIL_ID,
      };

      this.apiService.crearVehiculo(nuevoVehiculo).subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarFormulario();
          this.cargarVehiculos();
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.message || 'Error al crear el vehículo';
        },
      });
    }
  }

  confirmarEliminar(vehiculo: Vehiculo) {
    this.vehiculoAEliminar = vehiculo;
    this.mostrarConfirmacion = true;
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.vehiculoAEliminar = null;
  }

  eliminarVehiculo() {
    if (!this.vehiculoAEliminar) return;

    this.apiService.eliminarVehiculo(this.vehiculoAEliminar.id).subscribe({
      next: () => {
        this.cerrarConfirmacion();
        this.cargarVehiculos();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar el vehículo');
        this.cerrarConfirmacion();
      },
    });
  }
}
