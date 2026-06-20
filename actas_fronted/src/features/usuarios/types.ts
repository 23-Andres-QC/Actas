export type Rol = 'superadmin' | 'admin' | 'convocador' | 'asistente';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  areaId: string | null;
}
