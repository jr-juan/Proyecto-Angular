import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private auth: Auth, private firestore: Firestore, private router: Router) { }

    // Función para registrar un nuevo usuario
    async register({ email, password, nombre, apellidos }: any) {
        try {
            // 1. Creamos el usuario en el sistema de Autenticación de Firebase
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            if (user) {
                // 2. Si se crea el usuario, creamos un documento de perfil en Firestore
                // Apuntamos a la colección 'usuarios' y usamos el UID del usuario como ID del documento
                const userDocRef = doc(this.firestore, 'usuarios', user.uid);

                // 3. Guardamos los datos del perfil
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    nombre: nombre,
                    apellidos: apellidos,
                    rol: 'usuario' // Opcional: podemos asignar un rol por defecto
                });

                return user; // Devolvemos el usuario si todo fue exitoso
            }
            return null;

        } catch (e) {
            console.error("Error en el registro:", e);
            return null;
        }
    }

    // Función para iniciar sesión
    async login({ email, password }: any) {
        try {
            const user = await signInWithEmailAndPassword(this.auth, email, password);
            return user;
        } catch (e) {
            return null;
        }
    }

    // Función para cerrar sesión
    async logout() {
        try {
            // Usamos la función signOut de Firebase
            await signOut(this.auth);
            // Después de cerrar sesión, redirigimos al usuario a la página de login
            this.router.navigate(['/login']);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    }
}