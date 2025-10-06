import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio-optimizacion',
  standalone: true,
  template: `
    <h2>
      <i class="bi bi-lightning-charge"></i>
      Optimización y Rendimiento
    </h2>
    <p>Bienvenido al módulo de optimización (Lazy Loading + Code Splitting).</p>
    <p>Selecciona una opción de la barra de navegacion para continuar.</p>
  `
})
export class InicioOptimizacionComponent {}