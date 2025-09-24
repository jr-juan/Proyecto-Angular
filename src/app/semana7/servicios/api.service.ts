import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://apirecoleccion.gonzaloandreslucio.com/api';

  constructor(private http: HttpClient) { }

  getPerfiles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfiles`);
  }

  getRutasPorPerfil(perfilId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rutas?perfil_id=${perfilId}`);
  }

  getVehiculos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vehiculos`);
  }

}