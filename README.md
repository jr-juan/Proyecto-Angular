# PrimerProyecto

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.
Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

----

# Integrantes
- Juan Roman Cuero Ordoñez
- Heily Alexandra Estupiñan Marulanda
- Jhon Jader Riascos Angulo


# Semana 2 – Filosofía de la tecnología


## Pros de Angular

- Estructura robusta y escalabilidad.
- Inyección de dependencias.
- Pruebas integradas.
- Gran comunidad y recursos.
- Compilación AOT (Ahead-of-Time).
- CLI (Interfaz de Línea de Comandos).
- Actualizaciones periódicas y compatibilidad con versiones anteriores.
- Angular Universal.


## Contras de Angular

- Curva de aprendizaje pronunciada.
- Rendimiento en aplicaciones complejas.
- Mayor tamaño de la aplicación.
- Posibles problemas de migración entre versiones.
- Complejidad y verbosidad.
- Menor flexibilidad en comparación con otros frameworks.

## Resumen
Angular es un framework frontend desarrollado por Google que se caracteriza por su robustez, 
escalabilidad y uso de TypeScript. Su filosofía se centra en ofrecer una arquitectura bien 
estructurada que facilite el desarrollo de aplicaciones grandes y mantenibles. Sin embargo, 
su curva de aprendizaje es más pronunciada que la de otros frameworks, lo que lo hace más 
apropiado para proyectos complejos y equipos organizados.


## Ejemplo mínimo – Hola Mundo

```ts
// Archivo: app.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./styles.css']
})
export class AppComponent {
  title = 'PrimerProyecto';
  mensaje = 'Hola Mundo desde Angular';
}

// Archivo: app.html
// Uno simple:
<h1>{{ mensaje }}</h1>

// Archivo: styles.css
// (opcional, pero para que se vea bien):
h1 {
  color: darkblue;
  font-family: Arial, sans-serif;
}