import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ruta, CrearRuta, Vehiculo, Calle, RespuestaAPI } from '../modelos/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Nota: Lo ideal es usar 'environment.ts', pero para consistencia usamos la URL directa
  private urlBase = 'http://apirecoleccion.gonzaloandreslucio.com/api';

  // UUID del perfil
  readonly PERFIL_ID = '321d109f-6396-470a-b30a-ed347f8842c9';

  constructor(private http: HttpClient) {}

  // ==================== RUTAS ====================
  obtenerRutasPorPerfil(perfilId: string): Observable<RespuestaAPI<Ruta[]>> {
    return this.http.get<RespuestaAPI<Ruta[]>>(`${this.urlBase}/rutas?perfil_id=${perfilId}`);
  }

  obtenerRutaPorId(rutaId: string): Observable<RespuestaAPI<Ruta>> {
    return this.http.get<RespuestaAPI<Ruta>>(`${this.urlBase}/rutas/${rutaId}`);
  }

  crearRuta(ruta: CrearRuta): Observable<any> {
    const { perfil_id, ...rutaSinPerfil } = ruta;
    return this.http.post<any>(`${this.urlBase}/rutas?perfil_id=${this.PERFIL_ID}`, rutaSinPerfil);
  }


  eliminarRuta(rutaId: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/rutas/${rutaId}`);
  }

  // ==================== VEHÍCULOS  ====================

  obtenerVehiculos(): Observable<RespuestaAPI<Vehiculo[]>> {
    return this.http.get<RespuestaAPI<Vehiculo[]>>(
      `${this.urlBase}/vehiculos?perfil_id=${this.PERFIL_ID}`
    );
  }

  crearVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(
      `${this.urlBase}/vehiculos?perfil_id=${this.PERFIL_ID}`,
      vehiculo
    );
  }

  obtenerVehiculoPorId(vehiculoId: string): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(
      `${this.urlBase}/vehiculos/${vehiculoId}?perfil_id=${this.PERFIL_ID}`
    );
  }

  actualizarVehiculo(vehiculoId: string, datos: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(
      `${this.urlBase}/vehiculos/${vehiculoId}?perfil_id=${this.PERFIL_ID}`,
      datos
    );
  }

  eliminarVehiculo(vehiculoId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.urlBase}/vehiculos/${vehiculoId}?perfil_id=${this.PERFIL_ID}`
    );
  }

  // ==================== CALLES ====================
  obtenerCalles(): Observable<RespuestaAPI<Calle[]>> {
    return this.http.get<RespuestaAPI<Calle[]>>(`${this.urlBase}/calles`);
  }

  obtenerCallePorId(calleId: string): Observable<RespuestaAPI<Calle>> {
    return this.http.get<RespuestaAPI<Calle>>(`${this.urlBase}/calles/${calleId}`);
  }
}
