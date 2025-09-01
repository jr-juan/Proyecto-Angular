import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HijoComponent } from './semana4/hijo/hijo';
import { BotonComponent } from './semana4/boton/boton';
import { CicloComponent } from './semana4/ciclo/ciclo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HijoComponent, BotonComponent, CicloComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mensajePadre = signal('Hola desde el padre');
  contador = signal(0);

  manejarEventoHijo(nuevoValor: number) {
    this.contador.set(nuevoValor);
  }
}
