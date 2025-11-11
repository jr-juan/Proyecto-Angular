import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';

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
  // Nota: Lo ideal es usar 'environment.ts', pero para consistencia usamos la URL directa
  private urlBase = 'http://apirecoleccion.gonzaloandreslucio.com/api';

  // UUID del perfil
  readonly PERFIL_ID = '321d109f-6396-470a-b30a-ed347f8842c9';

  constructor(private http: HttpClient, private auth: Auth, private firestore: Firestore) {}
  
  // ==================== RUTAS ====================
  obtenerRutasPorPerfil(perfilId: string): Observable<RespuestaAPI<Ruta[]>> {
    return this.http.get<RespuestaAPI<Ruta[]>>(`${this.urlBase}/rutas?perfil_id=${perfilId}`);
  }

  obtenerRutaPorId(rutaId: string): Observable<RespuestaAPI<Ruta>> {
    return this.http.get<RespuestaAPI<Ruta>>(`${this.urlBase}/rutas/${rutaId}`);
  }

  crearRuta(ruta: CrearRuta): Observable<any> {
    const { perfil_id, ...rutaSinPerfil } = ruta;
    return this.http.post<any>(`${this.urlBase}/rutas?perfil_id=${this.PERFIL_ID}`, rutaSinPerfil);
  }

  eliminarRuta(rutaId: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/rutas/${rutaId}`);
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

  // ==================== CALLES ====================
  obtenerCalles(): Observable<RespuestaAPI<Calle[]>> {
    return this.http.get<RespuestaAPI<Calle[]>>(`${this.urlBase}/calles`);
  }

  obtenerCallePorId(calleId: string): Observable<RespuestaAPI<Calle>> {
    return this.http.get<RespuestaAPI<Calle>>(`${this.urlBase}/calles/${calleId}`);
  }
}
