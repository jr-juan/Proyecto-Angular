import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../estados/tarea_model';

@Component({
  selector: 'app-item-tarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item_tarea.component.html',
  styleUrls: ['./item_tarea.component.css']
})
export class ItemTareaComponent {
  
  @Input() tarea!: Tarea;

  @Output() tareaEliminada = new EventEmitter<number>();

  eliminar() {
    this.tareaEliminada.emit(this.tarea.id);
  }
}