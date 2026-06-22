import { Navigate, Outlet } from 'react-router-dom';
import { FileCheck2, Loader2 } from 'lucide-react';
import { useAuth, Rol } from './auth-context';

interface ProtectedRouteProps {
  roles?: Rol[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { session, rol, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <FileCheck2 className="size-5" />
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Validando sesión...
          </span>
        </div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (roles && (!rol || !roles.includes(rol))) return <Navigate to="/app" replace />;

  return <Outlet />;
}
