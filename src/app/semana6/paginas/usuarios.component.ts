import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page-container">
    <h1>Usuarios</h1>
    <p>Lista de usuarios en mi poder</p>
    <p>Click en cualquiera para ver su Id y su info:</p>
    <ul>
      <li><a [routerLink]="['/usuarios', 1]">Usuario 1</a></li>
      <li><a [routerLink]="['/usuarios', 2]">Usuario 2</a></li>
      <li><a [routerLink]="['/usuarios', 3]">Usuario 3</a></li>
    </ul>
    </div>
  `
})
export class UsuariosComponent {}
