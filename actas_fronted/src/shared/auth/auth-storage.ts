export type Rol = 'superadmin' | 'admin' | 'convocador' | 'asistente';

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  areaId: string | null;
  cargo: string | null;
}

export interface LocalSession { token: string; user: AuthUser }

const STORAGE_KEY = 'actas.session';

export function readSession(): LocalSession | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as LocalSession : null;
  } catch {
    return null;
  }
}

export function saveSession(session: LocalSession): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
export function clearSession(): void { localStorage.removeItem(STORAGE_KEY); }
export function getToken(): string | null { return readSession()?.token ?? null; }
