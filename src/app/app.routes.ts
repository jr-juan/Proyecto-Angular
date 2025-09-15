import { Routes } from '@angular/router';
import { InicioComponent } from './semana6/paginas/inicio.component';
import { AcercaComponent } from './semana6/paginas/acerca.component';
import { UsuariosComponent } from './semana6/paginas/usuarios.component';
import { UsuarioDetalleComponent } from './semana6/paginas/usuario_detalle.component';
import { AuthGuard } from './semana6/auth.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'acerca', component: AcercaComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/:id', component: UsuarioDetalleComponent },
  {
    path: 'administracion',
    loadChildren: () =>
      import('./semana6/lazy_loading/administracion.routes')
        .then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
