import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, Rol } from './auth-context';

interface ProtectedRouteProps {
  roles?: Rol[];
}

/**
 * Valida sesión y, opcionalmente, rol antes de renderizar. Es solo la
 * primera línea de defensa en la UI: el backend siempre vuelve a validar
 * con RBAC + RLS, esta ruta nunca es la única protección de un dato.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { session, rol, loading } = useAuth();

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Cargando...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && (!rol || !roles.includes(rol))) return <Navigate to="/app" replace />;

  return <Outlet />;
}
