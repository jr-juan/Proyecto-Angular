import { Injectable } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Vehiculo, CrearVehiculo, ActualizarVehiculo } from '../modelos/interfaces';

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

  formulario = {
    perfil_id: '',
    placa: '',
    marca: '',
    modelo: '',
    capacidad: 0,
    tipo_combustible: '',
    activo: true,
  };

  constructor(private apiService: ApiService) {}

  inicializar() {
    this.formulario = {
      perfil_id: this.apiService.PERFIL_ID,
      placa: '',
      marca: '',
      modelo: '',
      capacidad: 0,
      tipo_combustible: '',
      activo: true,
    };
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
      perfil_id: this.apiService.PERFIL_ID,
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
      perfil_id: this.apiService.PERFIL_ID,
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
      const datos: ActualizarVehiculo = {
        perfil_id: this.formulario.perfil_id,
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