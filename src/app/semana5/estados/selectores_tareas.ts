import { computed } from '@angular/core';
import { ReductorTareas } from './reductores_tareas';

export class SelectoresTareas {
  constructor(private store: ReductorTareas) {}

  todas = computed(() => this.store.tareas());
  
  total = computed(() => this.store.tareas().length);
}