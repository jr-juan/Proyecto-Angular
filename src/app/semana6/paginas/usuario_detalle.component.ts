import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  template: `
    <div class="page-container">
    <h1>Detalle del Usuario</h1>
    <p>ID recibido: {{ id }}</p>
    <p>Aquí nomas puedo mostrar el Id, si muestro mas me demandan :C</p>
    
    </div>
  `
})
export class UsuarioDetalleComponent {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
