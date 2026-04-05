import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
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
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  private urlBase = environmentApi.apiUrl;
  readonly PERFIL_ID = environmentPerfilId.perfilId;

  // ==================== RUTAS ====================
  obtenerRutasPorPerfil(perfilId: string): Observable<RespuestaAPI<Ruta[]>> {
    const user = this.auth.currentUser;
    if (!user) return of({ data: [] });

    const rutasCollection = collection(this.firestore, 'rutas');
    const q = query(rutasCollection, where('userId', '==', user.uid));

    return from(
      runInInjectionContext(this.injector, () => getDocs(q))
    ).pipe(
      map((snapshot) => ({
        data: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Ruta)),
      }))
    );
  }

  obtenerRutaPorId(idFirestore: string): Observable<RespuestaAPI<Ruta>> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'rutas', idFirestore);
    return from(
      runInInjectionContext(this.injector, () => getDoc(docRef))
    ).pipe(
      map((docSnap) => {
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
        const rutaParaFirestore = { ...rutaLimpia, idApiLucio: idReal, userId: user.uid };
        return from(
          runInInjectionContext(this.injector, () => addDoc(rutasCollection, rutaParaFirestore))
        );
      })
    );
  }

  actualizarRuta(idFirestore: string, datos: Partial<Ruta>): Observable<void> {
  const user = this.auth.currentUser;
  if (!user) return throwError(() => new Error('Usuario no autenticado'));

  const docRef = doc(this.firestore, 'rutas', idFirestore);
  return from(
    runInInjectionContext(this.injector, () =>
      updateDoc(docRef, datos as { [key: string]: any })
    )
  );
}

  eliminarRuta(idFirestore: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'rutas', idFirestore);
    return from(
      runInInjectionContext(this.injector, () => getDoc(docRef))
    ).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists() && docSnap.data()['userId'] === user.uid) {
          return from(runInInjectionContext(this.injector, () => deleteDoc(docRef)));
        }
        throw new Error('No tienes permiso para eliminar esta ruta');
      })
    );
  }

  // ==================== VEHÍCULOS ====================
  obtenerVehiculos(): Observable<RespuestaAPI<Vehiculo[]>> {
    const user = this.auth.currentUser;
    if (!user) return of({ data: [] });

    const vehiculosCollection = collection(this.firestore, 'vehiculos');
    const q = query(vehiculosCollection, where('userId', '==', user.uid));

    return from(
      runInInjectionContext(this.injector, () => getDocs(q))
    ).pipe(
      map((snapshot) => ({
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehiculo)),
      }))
    );
  }

  crearVehiculo(vehiculo: Vehiculo): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const vehiculoParaLucio = { ...vehiculo, perfil_id: this.PERFIL_ID };
    return this.http.post<any>(`${this.urlBase}/vehiculos`, vehiculoParaLucio).pipe(
      switchMap((respuestaDeLucio) => {
        const vehiculosCollection = collection(this.firestore, 'vehiculos');
        const vehiculoParaFirestore = { ...vehiculo, idApiLucio: respuestaDeLucio.id, userId: user.uid };
        return from(
          runInInjectionContext(this.injector, () => addDoc(vehiculosCollection, vehiculoParaFirestore))
        );
      })
    );
  }

  obtenerVehiculoPorId(idFirestore: string): Observable<Vehiculo> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'vehiculos', idFirestore);
    return from(
      runInInjectionContext(this.injector, () => getDoc(docRef))
    ).pipe(
      map((docSnap) => {
        if (docSnap.exists() && docSnap.data()['userId'] === user.uid) {
          return { id: docSnap.id, ...docSnap.data() } as Vehiculo;
        }
        throw new Error('Vehículo no encontrado o no tienes permiso para verlo');
      })
    );
  }

  actualizarVehiculo(idFirestore: string, datos: Vehiculo): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'vehiculos', idFirestore);
    return from(
      runInInjectionContext(this.injector, () => getDoc(docRef))
    ).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists() || docSnap.data()['userId'] !== user.uid) {
          throw new Error('Vehículo no encontrado o no tienes permiso');
        }
        const idApiLucio = docSnap.data()['idApiLucio'];
        return this.http
          .put<any>(`${this.urlBase}/vehiculos/${idApiLucio}?perfil_id=${this.PERFIL_ID}`, datos)
          .pipe(
            switchMap(() =>
              from(runInInjectionContext(this.injector, () => updateDoc(docRef, datos as { [key: string]: any })))
            )
          );
      })
    );
  }

  eliminarVehiculo(idFirestore: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) return throwError(() => new Error('Usuario no autenticado'));

    const docRef = doc(this.firestore, 'vehiculos', idFirestore);
    return from(
      runInInjectionContext(this.injector, () => getDoc(docRef))
    ).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists() || docSnap.data()['userId'] !== user.uid) {
          throw new Error('Vehículo no encontrado o no tienes permiso');
        }
        const idApiLucio = docSnap.data()['idApiLucio'];
        return this.http
          .delete<void>(`${this.urlBase}/vehiculos/${idApiLucio}?perfil_id=${this.PERFIL_ID}`)
          .pipe(
            switchMap(() =>
              from(runInInjectionContext(this.injector, () => deleteDoc(docRef)))
            )
          );
      })
    );
  }

  obtenerVehiculosDelChofer(choferId: string): Observable<RespuestaAPI<Vehiculo[]>> {
    const vehiculosCollection = collection(this.firestore, 'vehiculos');
    const q = query(vehiculosCollection, where('choferAsignado', '==', choferId));

    return from(
      runInInjectionContext(this.injector, () => getDocs(q))
    ).pipe(
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