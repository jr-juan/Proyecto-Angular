import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tarea } from '../../estados/tarea_model';

@Component({
  selector: 'app-agregar-tarea',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './agregar_tarea.component.html',
  styleUrls: ['./agregar_tarea.component.css']
})
export class AgregarTareaComponent {
  nuevaTarea: string = '';
  private contadorId = 0;

  @Output() agregar = new EventEmitter<Tarea>();

 onAgregar() {
  if (this.nuevaTarea.trim().length > 0) {
    const tarea: Tarea = {
      id: ++this.contadorId,
      texto: this.nuevaTarea
    };
    this.agregar.emit(tarea);
    this.nuevaTarea = '';
  }

  }
}