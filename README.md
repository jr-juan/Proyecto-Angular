# PrimerProyecto

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

----

# Semana 2 – Filosofía de la tecnología

## Pros de Angular

-- Estructura robusta y escalabilidad.
-- Inyección de dependencias.
-- Pruebas integradas.
-- Gran comunidad y recursos.
-- Compilación AOT (Ahead-of-Time).
-- CLI (Interfaz de Línea de Comandos).
-- Actualizaciones periódicas y compatibilidad con versiones anteriores.
-- Angular Universal.

## Contras de Angular

-- Curva de aprendizaje pronunciada.
-- Rendimiento en aplicaciones complejas.
-- Mayor tamaño de la aplicación.
-- Posibles problemas de migración entre versiones.
-- Complejidad y verbosidad.
-- Menor flexibilidad en comparación con otros frameworks.


## Ejemplo mínimo – Hola Mundo

-- *Archivo: app.ts*

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

-- *Archivo: app.html* Uno simple:

<h1>{{ mensaje }}</h1>

-- *Archivo: styles.css* (opcional, pero para que se vea bien):

h1 {
  color: darkblue;
  font-family: Arial, sans-serif;
}

----