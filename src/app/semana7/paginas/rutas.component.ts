import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RutasMapaLogica } from '../logica_componentes/rutas'; 

@Component({
  selector: 'app-rutas-mapa',
  standalone: true,
  imports: [CommonModule],
  providers: [RutasMapaLogica], 
  styleUrls: ['../estilos_componentes/rutas.css'],
  template: `
    <div class="container">
      <h2>Rutas y Mapa</h2>

      @if (logica.loading) {
      <div class="loading">Cargando rutas...</div>
      }

      <div class="content-wrapper">
        <!-- Mapa -->
        <div id="container-mapa" #containerMapa>
          <div id="map" #mapEl></div>
        </div>

        <!-- Lista de rutas -->
        <div class="rutas-lista">
          @if (logica.rutas.length > 0) {
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Color</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (ruta of logica.rutas; track ruta.id) {
              <tr (click)="logica.zoomToRuta(ruta)">
                <td>{{ ruta.nombre_ruta }}</td>
                <td>
                  <span class="color-box" [style.background]="ruta.color_hex"></span>
                  {{ ruta.color_hex }}
                </td>
                <td>
                  <button
                    class="btn-zoom"
                    (click)="logica.zoomToRuta(ruta); $event.stopPropagation()"
                  >
                    Ver
                  </button>
                </td>
              </tr>
              }
            </tbody>
          </table>
          } @else {
          <p class="sin-rutas">No hay rutas registradas.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class RutasMapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('containerMapa', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('mapEl', { static: true }) mapRef!: ElementRef<HTMLDivElement>;

  constructor(public logica: RutasMapaLogica) {}

  ngAfterViewInit(): void {
    this.logica.setMapElement(this.mapRef); 
    this.logica.inicializar();
  }

  ngOnDestroy(): void {
    this.logica.limpiar();
  }
}