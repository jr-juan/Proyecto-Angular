import { signal } from '@angular/core';
import { Tarea } from './tarea_model';
import { AgregarTarea, EliminarTarea } from './acciones_tareas';

let idCounter = 0;

export class ReductorTareas {
  
  tareas = signal<Tarea[]>([]);

  dispatch(action: any) {
    if (action instanceof AgregarTarea) {
      this.tareas.update((lista) => [
        ...lista,
        { id: ++idCounter, texto: action.payload }
      ]);
    }

    if (action instanceof EliminarTarea) {
      this.tareas.update((lista) =>
        lista.filter((t) => t.id !== action.id)
      );
    }
  }
}