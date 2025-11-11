import { Routes } from '@angular/router';
import { TableroComponent } from './semana7/paginas/tablero.component';
import { VehiculosComponent } from './semana7/paginas/vehiculos.component';
import { RutasMapaComponent } from './semana7/paginas/rutas.component';
import { LoginComponent } from './semana7/logica_componentes/login.logica';
import { RegistroComponent } from './semana7/logica_componentes/registro.logica';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'tablero', component: TableroComponent },
  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'rutas', component: RutasMapaComponent },
  { path: '**', redirectTo: 'login' }
];