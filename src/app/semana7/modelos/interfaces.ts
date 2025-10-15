// Interfaces para tipado fuerte en TypeScript de los modelos de datos, cualquier cosa lo buscan.

export interface Ruta {
  id: string;
  perfil_id: string;
  nombre_ruta: string;
  color_hex: string;
  shape: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrearRuta {
  nombre_ruta: string;
  calles: string[]; // Array de UUIDs de calles
  perfil_id: string;
}

export interface Vehiculo {
  id: string;
  perfil_id: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidad: number;
  tipo_combustible: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CrearVehiculo {
  perfil_id: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidad: number;
  tipo_combustible: string;
  activo: boolean;
}

export interface ActualizarVehiculo {
  perfil_id?: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  capacidad?: number;
  tipo_combustible?: string;
  activo?: boolean;
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