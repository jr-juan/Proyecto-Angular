import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  email = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  async onSubmit() {
    const response = await this.authService.register({
      email: this.email,
      password: this.password
    });

    if (response) {
      // Si el registro es exitoso, redirige al inicio
      console.log('¡Registro exitoso!', response);
      this.router.navigate(['/tablero']);
    } else {
      // Si hay un error, muestra una alerta
      alert('Error al registrar el usuario. El correo puede estar ya en uso.');
    }
  }
}