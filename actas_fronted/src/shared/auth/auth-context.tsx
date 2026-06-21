import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

export type Rol = 'superadmin' | 'admin' | 'convocador' | 'asistente';

interface AuthState {
  session: Session | null;
  rol: Rol | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const rol = (session?.user.app_metadata?.rol as Rol) ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        rol,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

/**
 * Espejo del RBAC del backend: centraliza qué puede ver/hacer el usuario en la UI.
 * Cada `esX` es exclusivo (un usuario tiene un solo rol). Para lógica de "admin o
 * superior" se compone explícitamente, ej. `esAdmin || esSuperAdmin`.
 */
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
