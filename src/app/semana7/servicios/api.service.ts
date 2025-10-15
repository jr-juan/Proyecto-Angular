import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  
  Ruta, 
  CrearRuta, 
  Vehiculo, 
  CrearVehiculo, 
  ActualizarVehiculo,
  Calle,
  RespuestaAPI 
} from '../modelos/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private urlBase = 'http://apirecoleccion.gonzaloandreslucio.com/api';
  
  // Nuestro UUID del perfil
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
    // Para rutas: perfil_id va en la URL, no en el body
    const { perfil_id, ...rutaSinPerfil } = ruta;
    return this.http.post<any>(
      `${this.urlBase}/rutas?perfil_id=${this.PERFIL_ID}`,
      rutaSinPerfil
    );
  }



  // ==================== VEHÍCULOS ====================
  obtenerVehiculos(): Observable<RespuestaAPI<Vehiculo[]>> {
    return this.http.get<RespuestaAPI<Vehiculo[]>>(`${this.urlBase}/vehiculos?perfil_id=${this.PERFIL_ID}`);
  }

  obtenerVehiculoPorId(vehiculoId: string): Observable<RespuestaAPI<Vehiculo>> {
    return this.http.get<RespuestaAPI<Vehiculo>>(`${this.urlBase}/vehiculos/${vehiculoId}?perfil_id=${this.PERFIL_ID}`);
  }

  crearVehiculo(vehiculo: CrearVehiculo): Observable<any> {
    // Para vehículos: perfil_id va en el body, NO se quita
    console.log('Datos completos enviados:', vehiculo);
    return this.http.post<any>(
      `${this.urlBase}/vehiculos`,
      vehiculo  // Se envía TODO incluyendo perfil_id
    );
  }

  actualizarVehiculo(vehiculoId: string, datos: ActualizarVehiculo): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}/vehiculos/${vehiculoId}?perfil_id=${this.PERFIL_ID}`,
      datos
    );
  }

  eliminarVehiculo(vehiculoId: string): Observable<any> {
    return this.http.delete<any>(
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