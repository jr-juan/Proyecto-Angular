import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './semana7/servicios/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PrimerProyecto');

  mostrarHeader = signal(true);
  // Detectar cambios de ruta para mostrar/ocultar el header del app.html
  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const rutasPublicas = ['/login', '/registro'];
        this.mostrarHeader.set(!rutasPublicas.includes(event.url));
      });
  }

  async cerrarSesion() {
    // Pedimos confirmación al usuario con un diálogo simple del navegador
    const confirmacion = confirm('¿Estás seguro de que quieres cerrar sesión?');

    if (confirmacion) {
      // Si el usuario hace clic en "Aceptar", llamamos a la función logout del servicio
      await this.authService.logout();
    }
  }
}
