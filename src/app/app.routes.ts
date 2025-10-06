import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./semana9/optimizacion.routes')
        .then(m => m.RUTAS_OPTIMIZACION)
  },
  { path: '**', redirectTo: '' }
];
