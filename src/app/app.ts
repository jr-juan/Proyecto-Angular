import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd} from '@angular/router';
import { filter } from 'rxjs/operators';

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
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const rutasPublicas = ['/login', '/registro'];
        this.mostrarHeader.set(!rutasPublicas.includes(event.url));
      });
  }
}
