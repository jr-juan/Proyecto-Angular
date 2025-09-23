// app.routes.ts
import { Routes } from '@angular/router';
import { InicioComponent} from './semana7/paginas/inicio.component';

export const routes: Routes = [
  {path: '', component: InicioComponent},
  {path: 'semana7', component: InicioComponent}, 
  {path: '**', redirectTo: ''} // Sino encuentra alguna ruta, va al inicio.
];