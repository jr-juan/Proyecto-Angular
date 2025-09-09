export class AgregarTarea {
  static readonly type = '[Tarea] Agregar';
  constructor(public payload: string) {}
}

export class EliminarTarea {
  static readonly type = '[Tarea] Eliminar';
  constructor(public id: number) {}
}