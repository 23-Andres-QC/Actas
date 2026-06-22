import { createContext, ReactNode, useContext, useState } from 'react';
import { clearSession, LocalSession, readSession, Rol, saveSession } from './auth-storage';

interface AuthState {
  session: LocalSession | null;
  rol: Rol | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(() => readSession());

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error?.message ?? 'No fue posible iniciar sesión');
    const nextSession: LocalSession = { token: body.token, user: body.usuario };
    saveSession(nextSession);
    setSession(nextSession);
  };

  const signOut = async () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, rol: session?.user.rol ?? null, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function useRol() {
  const { rol } = useAuth();
  return {
    rol,
    esSuperAdmin: rol === 'superadmin',
    esAdmin: rol === 'admin',
    esConvocador: rol === 'convocador',
    esAsistente: rol === 'asistente',
  };
}

export type { Rol } from './auth-storage';
