import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../estados/tarea_model';
import { ItemTareaComponent } from '../item_tarea/item_tarea.component';

@Component({
  selector: 'app-lista-tarea',
  standalone: true,
  imports: [CommonModule, ItemTareaComponent],
  templateUrl: './lista_tarea.component.html',
  styleUrls: ['./lista_tarea.component.css']
})
export class ListaTareaComponent {
  @Input() tareas: Tarea[] = [];
  @Output() eliminar = new EventEmitter<number>();

  onEliminar(id: number) {
    this.eliminar.emit(id);
  }
}