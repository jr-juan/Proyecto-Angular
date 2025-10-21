import { Routes } from '@angular/router';
import { TableroComponent } from './semana11/paginas/tablero.component';
import { VehiculosComponent } from './semana11/paginas/vehiculos.component';
import { RutasComponent } from './semana11/paginas/rutas.component';
import { LoginComponent } from './semana11/inicio_y_registro/login.component';
import { RegistroComponent } from './semana11/inicio_y_registro/registro.component';


import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// 2. función que indica a dónde redirigir si el usuario no está autenticado
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  // Rutas públicas 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas protegidas (solo para usuarios con sesión iniciada)
  
  {
    path: 'tablero',
    component: TableroComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'vehiculos',
    component: VehiculosComponent,
    canActivate: [AuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin } 
  },
  {
    path: 'rutas',
    component: RutasComponent,
    canActivate: [AuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin } 
  },

  // Si la URL no coincide con ninguna, redirige al login
  { path: '**', redirectTo: 'login' }
];