import { Routes } from '@angular/router';
import { TableroComponent } from './semana7/paginas/tablero.component';
import { VehiculosComponent } from './semana7/paginas/vehiculos.component';
import { RutasComponent } from './semana7/paginas/rutas.component';
import { LoginComponent } from './semana7/logica_componentes/login.logica';
import { RegistroComponent } from './semana7/logica_componentes/registro.logica';
import { ChoferComponent } from './semana7/paginas/chofer.component';
import { AsignacionesComponent } from './semana7/paginas/asignaciones.component';
import { authGuard, adminGuard, choferGuard } from './semana7/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Rutas solo para admin
  { path: 'tablero', component: TableroComponent, canActivate: [authGuard, adminGuard] },
  { path: 'vehiculos', component: VehiculosComponent, canActivate: [authGuard, adminGuard] },
  { path: 'rutas', component: RutasComponent, canActivate: [authGuard, adminGuard] },
  { path: 'asignaciones', component: AsignacionesComponent, canActivate: [authGuard, adminGuard] },

  // Rutas solo para chofer
  { path: 'chofer', component: ChoferComponent, canActivate: [authGuard, choferGuard] },

  { path: '**', redirectTo: 'login' },
];