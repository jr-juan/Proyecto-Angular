import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Página de Inicio</h1>
      <p>Bienvenido a la aplicación de ejemplo para la semana 6 :D</p>

      <p style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; line-height: 1.5;">
        <strong>Para acceder al Panel de Administración:</strong>
        <br><br>
        1. <strong>Click derecho</strong> → <strong>Inspeccionar</strong> → <strong>Application</strong> → <strong>Local Storage</strong>
        <br><br>
        2. Busca <strong>http://localhost:4200</strong> o como salga xd<br>
        <br><br>
        3. Escribe en Key = <strong>"autenticado"</strong> y en el de al lado Value = <strong>"true"</strong>
        <br><br>
        4. Guarda y recarga la página
        <br><br>
        Para dejar de ser admin: cambia el valor a "false" o elimina la fila.
      </p>
    </div>
  `
})
export class InicioComponent {}