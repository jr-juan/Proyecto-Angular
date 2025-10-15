import { Injectable } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Ruta, Vehiculo } from '../modelos/interfaces';

@Injectable()
export class TableroLogica {
  rutas: Ruta[] = [];
  vehiculos: Vehiculo[] = [];
  vehiculosActivos = 0;

  constructor(private apiService: ApiService) {}

  inicializar() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarRutas();
    this.cargarVehiculos();
  }

  private cargarRutas() {
    this.apiService.obtenerRutasPorPerfil(this.apiService.PERFIL_ID).subscribe({
      next: (res: any) => {
        this.rutas = res.data || res || [];
      },
      error: (err) => console.error('Error al cargar rutas:', err)
    });
  }

  private cargarVehiculos() {
    this.apiService.obtenerVehiculos().subscribe({
      next: (res: any) => {
        this.vehiculos = res.data || res || [];
        this.calcularVehiculosActivos();
      },
      error: (err) => console.error('Error al cargar vehículos:', err)
    });
  }

  private calcularVehiculosActivos() {
    this.vehiculosActivos = this.vehiculos.filter(v => v.activo).length;
  }

  obtenerUltimosVehiculos(cantidad: number = 5): Vehiculo[] {
    return this.vehiculos.slice(0, cantidad);
  }
}