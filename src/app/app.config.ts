import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';


// 1. Importaciones de Firebase 
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { authTokenInterceptor } from './semana7/servicios/auth-token-interceptor';


// 2. Credenciales de Firebase 
const firebaseConfig = {
  apiKey: "AIzaSyBzih4JgSip7dNFvKcsiWEUmemO-BsG_ak",
  authDomain: "proyecto-angular-dc7a2.firebaseapp.com",
  projectId: "proyecto-angular-dc7a2",
  storageBucket: "proyecto-angular-dc7a2.firebasestorage.app",
  messagingSenderId: "249237705233",
  appId: "1:249237705233:web:bcae208a71e5220b1ad7b0",
  measurementId: "G-PBQL9C844Q"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(), 
    provideRouter(routes),

    provideHttpClient(withInterceptors([authTokenInterceptor])),

    // Configuración de AngularFire
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};