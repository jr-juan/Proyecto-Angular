import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private enrutador: Router) {}

  canActivate(): boolean {
    const Autenticado = localStorage.getItem('autenticado');

    if (Autenticado === 'true') {
      return true; // permite mi acceso
    } else {
      alert('Acceso denegado, que yo sepa no eres admin XD.');
      this.enrutador.navigate(['/']); // vuelvo a inicio
      return false;
    }
  }
}
