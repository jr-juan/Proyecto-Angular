import { Component, signal } from '@angular/core';
import { AgregarTareaComponent } from './semana5/componentes/agregar_tarea/agregar_tarea.component';
import { ListaTareaComponent } from './semana5/componentes/lista_tarea/lista_tarea.component';
import { Tarea } from './semana5/estados/tarea_model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgregarTareaComponent, ListaTareaComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  
  tareas = signal<Tarea[]>([]);

  agregarTarea(tarea: Tarea) {
    this.tareas.update((lista) => [...lista, tarea]);
  }

  eliminarTarea(id: number) {
    this.tareas.update((lista) => lista.filter(t => t.id !== id));
  }

  total() {
    return this.tareas().length;
  }
}