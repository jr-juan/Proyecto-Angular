import { Injectable } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Vehiculo } from '../modelos/interfaces';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class VehiculosLogica {
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
  mensajeExito = '';

  formulario = {
    perfil_id: '',
    placa: '',
    marca: '',
    modelo: '',
    activo: true,
  };

  constructor(private apiService: ApiService) {}

  limpiarMensaje(tipo: 'error' | 'exito' | 'ninguno' = 'ninguno') {
    if (tipo === 'error' || tipo === 'ninguno') this.mensajeError = '';
    if (tipo === 'exito' || tipo === 'ninguno') this.mensajeExito = '';
  }

  inicializar() {
    this.formulario = {
      perfil_id: this.apiService.PERFIL_ID,
      placa: '',
      marca: '',
      modelo: '',
      activo: true,
    };
    this.limpiarMensaje('ninguno');
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.limpiarMensaje('error');
    
    this.apiService
      .obtenerVehiculos()
      .pipe(
        timeout(10000),
        catchError((err) => {
          
          console.error('Error al cargar vehículos:', err);
          if (err.name === 'TimeoutError') {
            this.mensajeError = 'La conexión tardó demasiado. Verifica que la API esté activa.';
          } else {
            this.mensajeError =
              'Error al cargar los vehículos: ' +
              (err.error?.message || err.message || 'API no disponible');
          }
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res) => {
          this.vehiculos = res.data || [];
          this.vehiculosFiltrados = this.vehiculos;
          this.filtrarVehiculos();
          
        },
        error: () => {
          
        },
      });
  }

  filtrarVehiculos() {
    const busquedaLower = this.busqueda.toLowerCase();
    this.vehiculosFiltrados = this.vehiculos.filter(
      (v) =>
        v.placa.toLowerCase().includes(busquedaLower) ||
        (v.marca?.toLowerCase() ?? '').includes(busquedaLower) ||
        (v.modelo?.toLowerCase() ?? '').includes(busquedaLower)
    );
  }

  abrirFormularioCrear() {
    this.modoEdicion = false;
    this.vehiculoEditando = null;
    this.formulario = {
      perfil_id: this.apiService.PERFIL_ID,
      placa: '',
      marca: '',
      modelo: '',
      activo: true,
    };
    this.limpiarMensaje('ninguno');
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(vehiculo: Vehiculo) {
    this.modoEdicion = true;
    this.vehiculoEditando = vehiculo;
    this.formulario = {
      perfil_id: this.apiService.PERFIL_ID,
      placa: vehiculo.placa,
      marca: vehiculo.marca ?? '',
      modelo: vehiculo.modelo ?? '',
      activo: vehiculo.activo,
    };
    this.limpiarMensaje('ninguno');
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.limpiarMensaje('ninguno');
  }

  guardarVehiculo() {
    if (!this.formulario.placa || !this.formulario.marca || !this.formulario.modelo) {
      this.mensajeError = 'La placa, marca y modelo son obligatorios.';
      return;
    }

    this.cargando = true;
    this.limpiarMensaje('ninguno');

    const vehiculoAEnviar: Vehiculo = {
      perfil_id: this.apiService.PERFIL_ID,
      placa: this.formulario.placa,
      marca: this.formulario.marca === '' ? null : this.formulario.marca,
      modelo: this.formulario.modelo === '' ? null : this.formulario.modelo,
      activo: this.formulario.activo,
    };

    const operacion =
      this.modoEdicion && this.vehiculoEditando && this.vehiculoEditando.id
        ? this.apiService.actualizarVehiculo(this.vehiculoEditando.id, vehiculoAEnviar)
        : this.apiService.crearVehiculo(vehiculoAEnviar);

    operacion
      .pipe(
        timeout(10000),
        catchError((err) => {
          this.cargando = false;

          if (err.name === 'TimeoutError') {
            this.mensajeError = 'La operación tardó demasiado. Verifica que la API esté activa.';
          } else if (err.status === 422) {
            if (err.error?.message?.includes('placa has already been taken')) {
              this.mensajeError = 'Esta placa ya existe. Usa una placa diferente.';
            } else {
              this.mensajeError = 'Datos inválidos. Verifica la información.';
            }
          } else if (err.status === 0) {
            this.mensajeError = 'No se pudo conectar con la API. Verifica que esté activa.';
          } else {
            this.mensajeError = err.error?.message || 'Error al procesar el vehículo.';
          }

          console.error('Error de operación:', err);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.cargando = false;
          this.cerrarFormulario();
          this.mensajeExito = this.modoEdicion
            ? 'Vehículo actualizado con éxito.'
            : 'Vehículo creado con éxito.';
          this.cargarVehiculos(); 

          setTimeout(() => {
            this.limpiarMensaje('exito');
          }, 3000);
        },
        error: () => {
          
        },
      });
  }

  confirmarEliminar(vehiculo: Vehiculo) {
    this.vehiculoAEliminar = vehiculo;
    this.mostrarConfirmacion = true;
    this.limpiarMensaje('ninguno');
  }

  cerrarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.vehiculoAEliminar = null;
    
    this.limpiarMensaje('ninguno'); // Limpiamos mensajes al cerrar
  }

  eliminarVehiculo() {
    if (!this.vehiculoAEliminar || !this.vehiculoAEliminar.id) return;

    
    this.limpiarMensaje('ninguno');

    this.apiService
      .eliminarVehiculo(this.vehiculoAEliminar.id)
      .pipe(
        timeout(10000),
        catchError((err) => {
          

          if (err.name === 'TimeoutError') {
            this.mensajeError = 'La operación tardó demasiado. Verifica que la API esté activa.';
          } else if (err.status === 0) {
            this.mensajeError = 'No se pudo conectar con la API.';
          } else {
            this.mensajeError = err.error?.message || 'Error al eliminar el vehículo.';
          }
          console.error('Error al eliminar:', err);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          const placaEliminada = this.vehiculoAEliminar?.placa;
         
          this.cerrarConfirmacion(); // Cerramos solo en caso de éxito
          this.mensajeExito = `Vehículo con placa ${placaEliminada} eliminado con éxito.`; // Recargar lista inmediatamente

          this.cargarVehiculos(); // Limpiar mensaje después de 3 segundos

          setTimeout(() => {
            this.limpiarMensaje('exito');
          }, 3000);
        },
        error: () => {
          
        },
      });
  }
}
