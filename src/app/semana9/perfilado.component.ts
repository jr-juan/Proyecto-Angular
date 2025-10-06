import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfilado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>
      <i class="bi bi-speedometer2"></i>
      Ejemplo de Perfilado
    </h3>
    <p>Presiona el botón para ejecutar un proceso pesado.</p>
    <p>Recuerda que los resultados se muestran en la consola del navegador :p</p>
    <button (click)="ejecutar()" [disabled]="ejecutando">
      <i class="bi bi-{{ ejecutando ? 'hourglass-split' : 'play-circle' }}"></i>
      {{ ejecutando ? 'Procesando...' : 'Ejecutar proceso' }}
    </button>

    @if (tiempoEjecucion !== null) {
      <p><strong>Tiempo de ejecución:</strong> {{ tiempoEjecucion }} ms</p>
      <p style="font-size: 0.9em; color: #6c757d;">
        <i class="bi bi-{{ obtenerIcono() }}"></i>
        {{ obtenerMensaje() }}
      </p>
    }
  `
})
export class PerfiladoComponent {
  tiempoEjecucion: number | null = null;
  ejecutando: boolean = false;

  ejecutar() {
    this.ejecutando = true;
    this.tiempoEjecucion = null;

    setTimeout(() => {
      console.time('Proceso pesado');
      const inicio = performance.now();
      
      let suma = 0;
      for (let i = 0; i < 100000; i++) {
        suma += i;
      }
      
      const fin = performance.now();
      this.tiempoEjecucion = Math.round(fin - inicio);
      console.timeEnd('Proceso pesado');
      
      this.ejecutando = false;
    });
  }

  obtenerIcono(): string {
    if (this.tiempoEjecucion! < 100) return 'lightning-charge-fill';
    if (this.tiempoEjecucion! < 500) return 'check-circle-fill';
    return 'exclamation-triangle-fill';
  }

  obtenerMensaje(): string {
    if (this.tiempoEjecucion! < 100) return 'Excelente rendimiento';
    if (this.tiempoEjecucion! < 500) return 'Buen rendimiento';
    return 'Considerar optimización';
  }
}