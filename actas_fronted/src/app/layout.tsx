import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AppSidebar } from '../components/app-sidebar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth, useRol } from '../shared/auth/auth-context';

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'SuperAdmin',
  admin: 'Admin',
  convocador: 'Convocador',
  asistente: 'Asistente',
};

export function Layout() {
  const { session, signOut } = useAuth();
  const { rol } = useRol();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar rol={rol} />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur">
          <div>
            <p className="font-display text-sm font-semibold text-primary">Actas Institucionales</p>
            <p className="text-xs text-muted-foreground">Plataforma de gestión de actas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{session?.user.email}</p>
              {rol && (
                <Badge variant="accent" className="mt-1 text-[10px]">
                  {ROLE_LABEL[rol] ?? rol}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
