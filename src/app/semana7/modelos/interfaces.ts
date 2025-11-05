// Interfaces para tipado fuerte en TypeScript de los modelos de datos.

export interface Ruta {
  id?: string; 
  perfil_id: string;
  nombre_ruta: string;
  color_hex?: string; 
  shape?: string; // GeoJSON en string coomo en la API 
}

export interface CrearRuta {
  nombre_ruta: string;
  perfil_id: string;
  color_hex?: string; 
  shape?: string; // String JSON GeoJSON
  calles_ids?: string[]; 
}


export interface Vehiculo {
  id?: string; // Opcional para la creación
  perfil_id: string;
  placa: string;
  marca: string | null; 
  modelo: string | null; 
  activo: boolean;
}

export interface Calle {
  id: string;
  nombre: string;
  shape: string;
}

export interface RespuestaAPI<T> {
  data?: T;
  message?: string;
  error?: string;
}