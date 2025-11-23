import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environmentApi, environmentPerfilId } from '../../../environments/environment';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from '@angular/fire/firestore';

import { Ruta, CrearRuta, Vehiculo, Calle, RespuestaAPI } from '../modelos/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private urlBase = environmentApi.apiUrl;

  // UUID del perfil
  readonly PERFIL_ID = environmentPerfilId.perfilId;

  constructor(private http: HttpClient, private auth: Auth, private firestore: Firestore) { }

  // ==================== RUTAS ====================
  obtenerRutasPorPerfil(perfilId: string): Observable<RespuestaAPI<Ruta[]>> {
    const user = this.auth.currentUser;
    if (!user) {
      return of({ data: [] });
    }

    const rutasCollection = collection(this.firestore, 'rutas');
    const q = query(rutasCollection, where('userId', '==', user.uid));

    return from(getDocs(q)).pipe(
      map((snapshot) => ({
        data: snapshot.docs.map((doc) => {
          // CORRECCIÓN AQUÍ:
          // 1. Primero esparcimos los datos (...doc.data())
          // 2. LUEGO asignamos el id real (id: doc.id)
          // Esto asegura que el ID real de Firestore sobreescriba cualquier "id" vacío que venga en los datos.
          return { ...doc.data(), id: doc.id } as Ruta;
        }),
      }))
    );
  }
  obtenerRutaPorId(idFirestore: string): Observable<RespuestaAPI<Ruta>> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'rutas', idFirestore);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists() && docSnap.data()['userId'] === user.uid) {
          return { data: { id: docSnap.id, ...docSnap.data() } as Ruta };
        }
        throw new Error('Ruta no encontrada');
      })
    );
  }

  crearRuta(ruta: CrearRuta): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const { perfil_id, ...rutaSinPerfil } = ruta;

    const { id, ...rutaLimpia } = rutaSinPerfil as any;

    return this.http.post<any>(`${this.urlBase}/rutas?perfil_id=${this.PERFIL_ID}`, rutaSinPerfil).pipe(
      switchMap((respuestaLucio) => {

        const idReal = respuestaLucio.data?.id;

        const rutasCollection = collection(this.firestore, 'rutas');
        const rutaParaFirestore = {
          ...rutaLimpia, // Usamos la ruta limpia sin el campo 'id' vacío
          idApiLucio: idReal,
          userId: user.uid
        };
        return from(addDoc(rutasCollection, rutaParaFirestore));
      })
    );
  }

  eliminarRuta(idFirestore: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'rutas', idFirestore);

    // Verificamos que la ruta pertenezca al usuario antes de borrar
    return from(getDoc(docRef)).pipe(
      switchMap(docSnap => {
        if (docSnap.exists() && docSnap.data()['userId'] === user.uid) {
          // Solo borramos de Firestore.
          return from(deleteDoc(docRef));
        }
        throw new Error('No tienes permiso para eliminar esta ruta');
      })
    );
  }

  // ==================== VEHÍCULOS  ====================

  obtenerVehiculos(): Observable<RespuestaAPI<Vehiculo[]>> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn(
        'Usuario no autenticado. No se pueden obtener vehículos. Mensaje desde ApiService.'
      );
      return of({ data: [] });
    }

    console.log('Mensaje desde ApiService');
    console.log('Obteniendo vehículos desde la base:');

    const vehiculosCollection = collection(this.firestore, 'vehiculos');
    const q = query(vehiculosCollection, where('userId', '==', user.uid));

    return from(getDocs(q)).pipe(
      map((snapshot) => ({
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehiculo)),
      }))
    );
  }

  crearVehiculo(vehiculo: Vehiculo): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    console.log('Mensaje desde ApiService');
    console.log('Enviando vehículo a la API', vehiculo);

    const vehiculoParaLucio = { ...vehiculo, perfil_id: this.PERFIL_ID };
    return this.http.post<any>(`${this.urlBase}/vehiculos`, vehiculoParaLucio).pipe(
      switchMap((respuestaDeLucio) => {
        const vehiculosCollection = collection(this.firestore, 'vehiculos');
        const vehiculoParaFirestore = {
          ...vehiculo,
          idApiLucio: respuestaDeLucio.id,
          userId: user.uid,
        };
        console.log('Guardando vehículo en Firestore:');
        return from(addDoc(vehiculosCollection, vehiculoParaFirestore));
      })
    );
  }

  obtenerVehiculoPorId(idFirestore: string): Observable<Vehiculo> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Apuntamos directamente al documento en Firestore por su ID
    const docRef = doc(this.firestore, 'vehiculos', idFirestore);

    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        // Verificamos si el documento existe y si el 'userId' coincide
        if (docSnap.exists() && docSnap.data()['userId'] === user.uid) {
          // Si todo está bien, devolvemos el vehículo
          return { id: docSnap.id, ...docSnap.data() } as Vehiculo;
        } else {
          // Si no existe o no pertenece al usuario, lanzamos un error
          throw new Error('Vehículo no encontrado o no tienes permiso para verlo');
        }
      })
    );
  }

  actualizarVehiculo(idFirestore: string, datos: Vehiculo): Observable<any> {
    console.log('Mensaje desde ApiService');
    console.log('Actualizando vehículo en la API y Firestore');
    console.log('ID Firestore:', idFirestore, 'con datos:', datos);

    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const docRef = doc(this.firestore, 'vehiculos', idFirestore);
    return from(getDoc(docRef)).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists() || docSnap.data()['userId'] !== user.uid) {
          throw new Error('Vehículo no encontrado o no tienes permiso');
        }
        const idApiLucio = docSnap.data()['idApiLucio'];

        console.log('Actualizando Vehiculo en API con idApiLucio', idApiLucio);

        return this.http
          .put<any>(`${this.urlBase}/vehiculos/${idApiLucio}?perfil_id=${this.PERFIL_ID}`, datos)
          .pipe(
            switchMap(() => from(updateDoc(docRef, datos as { [key: string]: any }))) // <-- Pequeño ajuste para TypeScript
          );
      })
    );
  }

  eliminarVehiculo(idFirestore: string): Observable<void> {
    console.log('Mensaje desde ApiService');
    console.log('Eliminando vehículo con ID Firestore:', idFirestore);

    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const docRef = doc(this.firestore, 'vehiculos', idFirestore);
    return from(getDoc(docRef)).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists() || docSnap.data()['userId'] !== user.uid) {
          throw new Error('Vehículo no encontrado o no tienes permiso');
        }
        const idApiLucio = docSnap.data()['idApiLucio'];

        console.log('Eliminando Vehiculo en API con idApiLucio', idApiLucio);

        return this.http
          .delete<void>(`${this.urlBase}/vehiculos/${idApiLucio}?perfil_id=${this.PERFIL_ID}`)
          .pipe(switchMap(() => from(deleteDoc(docRef))));
      })
    );
  }


  obtenerVehiculosDelChofer(choferId: string): Observable<RespuestaAPI<Vehiculo[]>> {
    const vehiculosCollection = collection(this.firestore, 'vehiculos');
    const q = query(vehiculosCollection, where('choferAsignado', '==', choferId));

    return from(getDocs(q)).pipe(
      map((snapshot) => ({
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehiculo)),
      }))
    );
  }

  // ==================== CALLES ====================
  obtenerCalles(): Observable<RespuestaAPI<Calle[]>> {
    return this.http.get<RespuestaAPI<Calle[]>>(`${this.urlBase}/calles`);
  }

  obtenerCallePorId(calleId: string): Observable<RespuestaAPI<Calle>> {
    return this.http.get<RespuestaAPI<Calle>>(`${this.urlBase}/calles/${calleId}`);
  }
}
