import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RutasMapaLogica } from '../logica_componentes/rutas';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [RutasMapaLogica],
  styleUrls: ['../estilos_componentes/rutas.css'],
  template: `
    <div class="rutas-contenedor">
      <div class="encabezado">
        <h2>Gestión de Rutas</h2>
        <p class="subtitulo">Crea y visualiza rutas en el mapa</p>
      </div>

      <!-- Mensajes de éxito y error -->
      @if (logica.mensajeExito) {
      <div class="mensaje-exito">
        {{ logica.mensajeExito }}
        <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('exito')">✕</button>
      </div>
      } @if (logica.mensajeError) {
      <div class="mensaje-error">
        {{ logica.mensajeError }}
        <button class="btn-cerrar-mensaje" (click)="logica.limpiarMensaje('error')">✕</button>
      </div>
      }

      <!-- Controles del mapa -->
      <div class="controles">
        @if (!logica.dibujandoRuta) {
        <button class="btn-primario" (click)="logica.iniciarDibujoRuta()">
          + Dibujar Nueva Ruta
        </button>
        } @else {
        <div class="panel-dibujo">
          <div class="panel-header">
            <h3>Dibujando Ruta</h3>
            <p>Haz clic en el mapa para agregar puntos a tu ruta</p>
          </div>

          <div class="campo">
            <label>Nombre de la Ruta *</label>
            <input
              type="text"
              [(ngModel)]="logica.newRutaName"
              placeholder="Ej: Ruta Centro-Norte"
              class="input-texto"
            />
          </div>

          <div class="campo">
            <label>Color de la Ruta</label>
            <p class="descripcion-campo">
              Elige el color con el que se mostrará la ruta en el mapa
            </p>

            <!-- Solo 3 colores rápidos -->
            <div class="colores-rapidos">
              <button
                type="button"
                class="btn-color-rapido"
                [style.background]="'#FF0000'"
                [class.seleccionado]="logica.newRutaColor.toUpperCase() === '#FF0000'"
                (click)="logica.newRutaColor = '#FF0000'; logica.actualizarColorDibujo()"
                title="Rojo"
              ></button>
              <button
                type="button"
                class="btn-color-rapido"
                [style.background]="'#0000FF'"
                [class.seleccionado]="logica.newRutaColor.toUpperCase() === '#0000FF'"
                (click)="logica.newRutaColor = '#0000FF'; logica.actualizarColorDibujo()"
                title="Azul"
              ></button>
              <button
                type="button"
                class="btn-color-rapido"
                [style.background]="'#00FF00'"
                [class.seleccionado]="logica.newRutaColor.toUpperCase() === '#00FF00'"
                (click)="logica.newRutaColor = '#00FF00'; logica.actualizarColorDibujo()"
                title="Verde"
              ></button>
            </div>

            <!-- Selector personalizado -->
            <div class="color-selector-custom">
              <label class="color-preview-label">
                <input
                  type="color"
                  [(ngModel)]="logica.newRutaColor"
                  (ngModelChange)="logica.actualizarColorDibujo()"
                  class="input-color-hidden"
                />
                <div class="color-preview-box">
                  <span class="color-muestra" [style.background]="logica.newRutaColor"></span>
                  <span class="color-info">
                    <span class="color-label">Color personalizado</span>
                    <span class="color-valor">{{ logica.newRutaColor }}</span>
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="botones">
            <button
              class="btn-cancelar"
              (click)="logica.cancelarDibujo()"
              [disabled]="logica.saving"
            >
              Cancelar
            </button>
            <button class="btn-guardar" (click)="logica.guardarRuta()" [disabled]="logica.saving">
              {{ logica.saving ? 'Guardando...' : 'Guardar Ruta' }}
            </button>
          </div>
        </div>
        }
      </div>

      <!-- Contenedor del mapa -->
      <div class="mapa-wrapper">
        @if (logica.loading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando mapa...</p>
        </div>
        }
        <div #mapContainer class="mapa-contenedor"></div>
      </div>

      <!-- Lista de rutas -->
      <div class="lista-rutas">
        <div class="lista-header">
          <h3>Rutas Registradas</h3>
          <span class="badge-contador">{{ logica.rutas.length }}</span>
        </div>

        @if (logica.rutas.length > 0) {
        <div class="grid-rutas">
          @for (ruta of logica.rutas; track ruta.id) {
          <div class="tarjeta-ruta" (click)="logica.zoomToRuta(ruta)">
            <div class="ruta-color-bar" [style.background]="ruta.color_hex"></div>
            <div class="ruta-contenido">
              <h4>{{ ruta.nombre_ruta }}</h4>
              <p class="ruta-meta">
                <span class="icono">📍</span>
                <span class="ruta-id">ID: {{ ruta.id }}</span>
              </p>
              <button class="btn-ver-ruta">Ver en mapa →</button>
            </div>
          </div>
          }
        </div>
        } @else {
        <div class="sin-datos">
          <div class="icono-vacio">Sin resultados</div>
          <p>No hay rutas registradas</p>
          <p class="texto-secundario">Crea tu primera ruta usando el botón "Dibujar Nueva Ruta"</p>
        </div>
        }
      </div>
    </div>
  `,
})
export class RutasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  constructor(public logica: RutasMapaLogica) {}

  ngOnInit(): void {
    // Componente inicializado
  }

  ngAfterViewInit(): void {
    // Establecer el elemento del mapa e inicializar
    this.logica.setMapElement(this.mapContainer);
    this.logica.inicializar();
  }

  ngOnDestroy(): void {
    this.logica.limpiar();
  }
}
