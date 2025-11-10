import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  // Variables para todos los campos del formulario
  nombre = '';
  apellidos = '';
  email = '';
  password = '';
  confirmarPassword = '';
  
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  async registrarse() {
    // Validación simple
    if (this.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (!this.email || !this.password || !this.nombre || !this.apellidos) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // Llamamos al nuevo método 'register' con todos los datos
    const user = await this.authService.register({
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      apellidos: this.apellidos
    });

    if (user) {
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      this.router.navigate(['/login']);
    } else {
      alert('Error al registrar. El correo puede estar ya en uso o la contraseña es muy débil.');
    }
  }
}