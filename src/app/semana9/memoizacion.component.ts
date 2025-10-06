import { Component } from '@angular/core';
import { CalculadoraService } from './servicio/calculadora.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memoizacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>
      <i class="bi bi-memory"></i>
      Ejemplo de Memoización
    </h3>
    <p>Presiona el botón para calcular el factorial de 10.</p>
    <p>Recuerda que los resultados se muestran en la consola del navegador :p</p>
    <button (click)="calcular()">
      <i class="bi bi-calculator"></i>
      Calcular
    </button>

    @if (resultado !== null) {
      <p><strong>Resultado:</strong> {{ resultado }}</p>
      <p style="font-size: 0.9em; color: #6c757d;">
        <i class="bi bi-{{ esCacheado ? 'lightning-charge-fill' : 'hourglass-split' }}"></i>
        {{ esCacheado ? 'Obtenido desde caché' : 'Calculado por primera vez' }}
      </p>
    }
  `
})
export class MemoizacionComponent {
  resultado: number | null = null;
  esCacheado: boolean = false;

  constructor(private calculadora: CalculadoraService) {}

  calcular() {
    const yaExistiaEnCache = this.calculadora['cache'].has(10);
    this.resultado = this.calculadora.factorial(10);
    this.esCacheado = yaExistiaEnCache;
  }
}