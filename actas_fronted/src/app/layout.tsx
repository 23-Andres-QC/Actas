import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
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
  const { rol, esJefe } = useRol();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    queryClient.clear();
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar rol={rol} esJefe={esJefe} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-primary">Actas Institucionales</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Gestión y seguimiento institucional</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="max-w-48 truncate text-sm font-medium leading-none">{session?.user.email}</p>
              {rol && (
                <Badge variant="accent" className="mt-1 text-[10px]">
                  {ROLE_LABEL[rol] ?? rol}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
