import { Routes } from '@angular/router';
import { InicioOptimizacionComponent } from './inicio_optimizacion.component';
import { MemoizacionComponent } from './memoizacion.component';
import { PerfiladoComponent } from './perfilado.component';

export const RUTAS_OPTIMIZACION: Routes = [
  { path: '', component: InicioOptimizacionComponent },
  { path: 'memoizacion', component: MemoizacionComponent },
  { path: 'perfilado', component: PerfiladoComponent }
];
