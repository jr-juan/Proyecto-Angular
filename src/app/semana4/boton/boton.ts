import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'boton',
  standalone: true,
  templateUrl: './boton.html',
  styleUrl: './boton.css'
})
export class BotonComponent {
  @Output() clicEnBoton = new EventEmitter<number>();
  valor = 0;

  incrementar() {
    this.valor++;
    this.clicEnBoton.emit(this.valor);
  }
}
