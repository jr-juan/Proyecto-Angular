import { Injectable } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Vehiculo } from '../modelos/interfaces';
import { AuthService } from '../servicios/auth';

@Injectable()
export class ChoferLogica {
  vehiculosAsignados: Vehiculo[] = [];
  vehiculosActivos = 0;
  nombreChofer = '';
  cargando = false;
  mensajeError = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  inicializar() {
    // Obtener el userId del chofer desde AuthService o similar
    this.nombreChofer = 'Chofer'; // Placeholder
    this.cargarVehiculosAsignados();
  }

  cargarVehiculosAsignados() {
    this.cargando = true;
    this.mensajeError = '';
    const choferId = this.authService.currentUser?.uid;
    if (!choferId) {
      this.mensajeError = 'No se encontró el ID del chofer.';
      this.cargando = false;
      return;
    }

    this.apiService.obtenerVehiculosDelChofer(choferId).subscribe({
      next: (res) => {
        this.vehiculosAsignados = res.data || [];
        this.calcularVehiculosActivos();
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar t us vehículos asignados.';
        console.error('Error al cargar vehículos asignados:', err);
        this.cargando = false;
      },
    });
  }


  private calcularVehiculosActivos() {
    this.vehiculosActivos = this.vehiculosAsignados.filter(v => v.activo).length;
  }

  // Método  rutas asignadas Si lo  queremos meter
  cargarRutasAsignadas() {
    // Implementación futura
  }
}