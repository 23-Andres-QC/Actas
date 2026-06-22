export type Rol = 'superadmin' | 'admin' | 'convocador' | 'asistente';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  areaId: string | null;
  areaNombre: string | null;
  esJefe: boolean;
  cargo: string | null;
}

export interface CrearUsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  areaId: string | null;
  cargo: string | null;
}
