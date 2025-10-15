import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  // Inyección de dependencias
  private authService = inject(AuthService);
  private router = inject(Router);

  async onSubmit() {
    const response = await this.authService.login({
      email: this.email,
      password: this.password
    });

    if (response) {
      // Si el login es exitoso, redirige al inicio
      this.router.navigate(['/tablero']);
    } else {
      // Si hay un error, muestra una alerta
      alert('Error en el email o la contraseña');
    }
  }
} 