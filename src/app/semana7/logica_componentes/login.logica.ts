import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['../estilos_componentes/login.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async iniciarSesion() {
    if (!this.email || !this.password) {
      alert('Por favor, ingresa correo y contraseña.');
      return;
    }

    const user = await this.authService.login({
      email: this.email,
      password: this.password
    });

    if (user) {
      // Si el login es exitoso, navegamos al tablero
      this.router.navigate(['/tablero']);
    } else {
      alert('Error en el correo o la contraseña. Por favor, inténtalo de nuevo.');
    }
  }
}