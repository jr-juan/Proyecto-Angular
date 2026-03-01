import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);

  private rolUsuarioSubject = new BehaviorSubject<'admin' | 'chofer' | null>(null);
  public rolUsuario$: Observable<'admin' | 'chofer' | null> = this.rolUsuarioSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const rol = await runInInjectionContext(this.injector, () =>
          this.obtenerRolUsuario(user.uid),
        );
        this.rolUsuarioSubject.next(rol);
      } else {
        this.rolUsuarioSubject.next(null);
      }
    });
  }

  async register({ email, password, nombre, apellidos }: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(this.firestore, 'usuarios', user.uid);
        await runInInjectionContext(this.injector, () =>
          setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            nombre,
            apellidos,
            rol: 'chofer',
          }),
        );
        this.rolUsuarioSubject.next('chofer');
        return user;
      }
      return null;
    } catch (e) {
      console.error('Error en el registro:', e);
      return null;
    }
  }

  async login({ email, password }: any): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        const rol = await runInInjectionContext(this.injector, () =>
          this.obtenerRolUsuario(user.uid),
        );
        this.rolUsuarioSubject.next(rol);
      }

      return user;
    } catch (e) {
      console.error('Error en login:', e);
      return null;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.rolUsuarioSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async obtenerRolUsuario(uid: string): Promise<'admin' | 'chofer' | null> {
    try {
      const userDocRef = doc(this.firestore, 'usuarios', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData['rol'] || 'chofer';
      }
      return null;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return null;
    }
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  get rolActual(): 'admin' | 'chofer' | null {
    return this.rolUsuarioSubject.value;
  }
}
