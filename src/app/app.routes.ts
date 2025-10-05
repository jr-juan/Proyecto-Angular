import { Routes } from '@angular/router';
import { TableroComponent } from './semana7/paginas/tablero.component';
import { VehiculosComponent } from './semana7/paginas/vehiculos.component';
import { RutasComponent } from './semana7/paginas/rutas.component';
import { LoginComponent } from './semana7/inicio_y_registro/login.component';
import { RegistroComponent } from './semana7/inicio_y_registro/registro.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'tablero', component: TableroComponent },
  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'rutas', component: RutasComponent },
  { path: '**', redirectTo: 'login' }
];