import { Injectable } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Vehiculo } from '../modelos/interfaces';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Chofer {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: string;
}

@Injectable()
export class AsignacionesLogica {
  choferes: Chofer[] = [];
  choferesFiltrados: Chofer[] = [];
  busquedaChofer = '';

  vehiculos: Vehiculo[] = [];
  vehiculosDisponibles: Vehiculo[] = [];
  vehiculosDisponiblesFiltrados: Vehiculo[] = [];
  busquedaVehiculo = '';

  mostrarModal = false;
  choferSeleccionado: Chofer | null = null;

  cargando = false;
  cargandoVehiculos = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private apiService: ApiService,
    private firestore: Firestore
  ) {}

  limpiarMensaje(tipo: 'error' | 'exito' | 'ninguno' = 'ninguno') {
    if (tipo === 'error' || tipo === 'ninguno') this.mensajeError = '';
    if (tipo === 'exito' || tipo === 'ninguno') this.mensajeExito = '';
  }

  async inicializar() {
    this.cargando = true;
    await Promise.all([
      this.cargarChoferes(),
      this.cargarVehiculos()
    ]);
    this.cargando = false;
  }

  async cargarChoferes() {
    try {
      const choferesCollection = collection(this.firestore, 'usuarios');
      const q = query(choferesCollection, where('rol', '==', 'chofer'));
      const snapshot = await getDocs(q);

      this.choferes = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as Chofer));

      this.choferesFiltrados = this.choferes;
    } catch (error) {
      console.error('Error al cargar choferes:', error);
      this.mensajeError = 'Error al cargar la lista de choferes.';
    }
  }

  cargarVehiculos() {
    this.apiService.obtenerVehiculos()
      .pipe(
        timeout(10000),
        catchError(err => {
          console.error('Error al cargar vehículos:', err);
          this.mensajeError = 'Error al cargar vehículos.';
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res) => {
          this.vehiculos = res.data || [];
        }
      });
  }

  filtrarChoferes() {
    const busquedaLower = this.busquedaChofer.toLowerCase();
    this.choferesFiltrados = this.choferes.filter(chofer =>
      chofer.nombre.toLowerCase().includes(busquedaLower) ||
      chofer.apellidos.toLowerCase().includes(busquedaLower) ||
      chofer.email.toLowerCase().includes(busquedaLower)
    );
  }
  
  contarVehiculosAsignados(choferId: string): number {
  //  return this.vehiculos.filter(v => v.choferAsignado === choferId).length;
  return 0; // Temporal mientras no se implemente choferAsignado   CAMBIAR LUEGO
  }

  obtenerVehiculosDelChofer(choferId: string): Vehiculo[] {
   // return this.vehiculos.filter(v => v.choferAsignado === choferId);
    return []; // Temporal mientras no se implemente choferAsignado CAMBIAR LUEGO
  }
  
  abrirModalAsignacion(chofer: Chofer) {
    this.choferSeleccionado = chofer;
    this.vehiculosDisponibles = this.vehiculos;
    this.vehiculosDisponiblesFiltrados = this.vehiculos;
    this.busquedaVehiculo = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.choferSeleccionado = null;
    this.busquedaVehiculo = '';
  }

  filtrarVehiculosDisponibles() {
    const busquedaLower = this.busquedaVehiculo.toLowerCase();
    this.vehiculosDisponiblesFiltrados = this.vehiculosDisponibles.filter(v =>
      v.placa.toLowerCase().includes(busquedaLower) ||
      (v.marca?.toLowerCase() ?? '').includes(busquedaLower) ||
      (v.modelo?.toLowerCase() ?? '').includes(busquedaLower)
    );
  }

  async asignarVehiculo(vehiculoId: string) {
    if (!this.choferSeleccionado) return;

    this.cargandoVehiculos = true;
    this.limpiarMensaje();

    try {
      const vehiculoRef = doc(this.firestore, 'vehiculos', vehiculoId);
      await updateDoc(vehiculoRef, {
        choferAsignado: this.choferSeleccionado.uid
      });

      this.mensajeExito = `Vehículo asignado exitosamente a ${this.choferSeleccionado.nombre}`;
      
      // Actualizar localmente
      const vehiculo = this.vehiculos.find(v => v.id === vehiculoId);
      if (vehiculo) {
       // vehiculo.choferAsignado = this.choferSeleccionado.uid;
      }

      this.cerrarModal();
      await this.cargarVehiculos();
    } catch (error) {
      console.error('Error al asignar vehículo:', error);
      this.mensajeError = 'Error al asignar el vehículo.';
    } finally {
      this.cargandoVehiculos = false;
    }
  }

  async desasignarVehiculo(vehiculoId: string, choferId: string) {
    const confirmacion = confirm('¿Estás seguro de quitar la asignación de este vehículo?');
    if (!confirmacion) return;

    try {
      const vehiculoRef = doc(this.firestore, 'vehiculos', vehiculoId);
      await updateDoc(vehiculoRef, {
        choferAsignado: null
      });

      this.mensajeExito = 'Asignación removida exitosamente.';
      
      // Actualizar localmente
      const vehiculo = this.vehiculos.find(v => v.id === vehiculoId);
      if (vehiculo) {
       // vehiculo.choferAsignado = null;
      }

      await this.cargarVehiculos();
    } catch (error) {
      console.error('Error al desasignar vehículo:', error);
      this.mensajeError = 'Error al quitar la asignación.';
    }
  }
}