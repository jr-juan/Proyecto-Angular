import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  private cache = new Map<number, number>();

  factorial(numero: number): number {
    if (this.cache.has(numero)) {
      console.log('Usando valor en caché para', numero);
      return this.cache.get(numero)!;
    }
    
    let resultado = 1;
    for (let i = 1; i <= numero; i++) {
      resultado *= i;
    }
    
    this.cache.set(numero, resultado);
    console.log('Calculado y guardado en caché:', numero);
    return resultado;
  }
}