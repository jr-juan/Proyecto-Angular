import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../servicios/api.service";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor">
      <h2>Personajes de Rick y Morty</h2>
      
      <input 
        type="text" 
        [(ngModel)]="busqueda"
        (input)="filtrar()"
        placeholder="Buscar personaje..."
      >

      @if (cargando) {
        <p>Cargando...</p>
      }

      @if (!cargando) {
        <div class="cartas">
          @for (p of personajes; track p.id) {
            <div class="carta">
              <img [src]="p.image" [alt]="p.name">
              <h3>{{ p.name }}</h3>
              <p>{{ p.species }} - {{ p.status }}</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class InicioComponent implements OnInit {
  personajes: any[] = [];
  todosPersonajes: any[] = [];
  busqueda = '';
  cargando = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getDatos().subscribe(datos => {
      this.todosPersonajes = datos.results;
      this.personajes = this.todosPersonajes;
      this.cargando = false;
    });
  }

  filtrar() {
    if (!this.busqueda) {
      this.personajes = this.todosPersonajes;
    } else {
      this.personajes = this.todosPersonajes.filter(p =>
        p.name.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }
  }
}