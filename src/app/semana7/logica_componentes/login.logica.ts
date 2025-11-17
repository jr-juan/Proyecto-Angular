import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: '../inicio_y_registro/login.component.html',
  styleUrls: ['../estilos_componentes/login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  async iniciarSesion() {
    if (!this.email || !this.password) {
      alert('Por favor, ingresa correo y contraseña.');
      return;
    }

    const user = await this.authService.login({
      email: this.email,
      password: this.password,
    });

    if (user) {
      // Esperar un pequeño delay para asegurar que el rol se cargó
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const rol = this.authService.rolActual;
      
      console.log('Rol que inicio sesion:', rol); 

      if (rol === 'admin') {
        this.router.navigate(['/tablero']);
      } else {
        this.router.navigate(['/chofer']);
      }
    } else {
      alert('Error en el correo o la contraseña. Por favor, inténtalo de nuevo.');
    }
  }
}
