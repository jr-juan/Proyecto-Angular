import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../servicios/api.service";

@Component({
  selector: "app-inicio",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor">
      <h2>Gestión de Perfiles, Rutas y Vehículos</h2>

      <!-- Buscador -->
      <input
        type="text"
        [(ngModel)]="busqueda"
        (input)="filtrar()"
        placeholder="Busque su perfil :D"
        class="buscador"
      />

      <div class="columnas">
        <!-- Columna izquierda: Perfiles -->
        <div class="columna">
          <h3>Perfiles</h3>
          @if (perfilesFiltrados.length > 0) {
            @for (p of perfilesFiltrados; track p.id) {
              <div class="carta perfil" (click)="cargarRutas(p.id)">
                <h4>{{ p.nombre_perfil }}</h4>
                <p><strong>ID:</strong> {{ p.id }}</p>
                <p><strong>Activo:</strong> {{ p.activo ? "Sí" : "No" }}</p>
              </div>
            }
          } @else {
            <p>No hay perfiles.</p>
          }
        </div>

        <!-- Columna central: Rutas -->
        <div class="columna">
          <h3>Rutas</h3>
          @if (rutas.length > 0) {
            @for (r of rutas; track r.id) {
              <div class="carta ruta">
                <h4>{{ r.nombre_ruta }}</h4>
                <p><strong>ID:</strong> {{ r.id }}</p>
                <p>
                  <strong>Color:</strong>
                  <span class="color-box" [style.background]="r.color_hex"></span>
                  {{ r.color_hex }}
                </p>
                <p><strong>Shape:</strong> {{ r.shape }}</p>
              </div>
            }
          } @else {
            <p>No hay rutas para este perfil.</p>
          }
        </div>

        <!-- Columna derecha: Vehículos -->
        <div class="columna">
          <h3>Vehículos</h3>
          @if (vehiculos.length > 0) {
            @for (v of vehiculos; track v.id) {
              <div class="carta vehiculo">
                <p><strong>Placa:</strong> {{ v.placa }}</p>
                <p><strong>Marca:</strong> {{ v.marca }}</p>
                <p><strong>Modelo:</strong> {{ v.modelo }}</p>
                <p><strong>Capacidad:</strong> {{ v.capacidad }}</p>
                <p><strong>Combustible:</strong> {{ v.tipo_combustible }}</p>
              </div>
            }
          } @else {
            <p>No hay vehículos.</p>
          }
        </div>
      </div>
    </div>
  `
})
export class InicioComponent implements OnInit {
  perfiles: any[] = [];
  perfilesFiltrados: any[] = [];
  rutas: any[] = [];
  vehiculos: any[] = [];
  busqueda = "";

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Perfiles
    this.apiService.getPerfiles().subscribe({
      next: res => {
        console.log("Perfiles API:", res);
        this.perfiles = res.data || res || [];
        this.perfilesFiltrados = this.perfiles;
        if (this.perfiles.length > 0) {
          this.cargarRutas(this.perfiles[0].id);
        }
      },
      error: err => console.error("Error perfiles:", err)
    });

    // Vehículos
    this.apiService.getVehiculos().subscribe({
      next: res => {
        console.log("Vehículos API:", res);
        this.vehiculos = res.data || res || [];
      },
      error: err => console.error("Error vehículos:", err)
    });
  }

  cargarRutas(perfilId: string) {
    this.apiService.getRutasPorPerfil(perfilId).subscribe({
      next: res => {
        console.log("Rutas API:", res);
        this.rutas = res.data || res || [];
      },
      error: err => console.error("Error rutas:", err)
    });
  }

  filtrar() {
    if (!this.busqueda) {
      this.perfilesFiltrados = this.perfiles;
    } else {
      this.perfilesFiltrados = this.perfiles.filter(p =>
        p.nombre_perfil.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }
  }
}