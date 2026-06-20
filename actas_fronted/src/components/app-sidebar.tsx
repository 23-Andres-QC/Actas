import { NavLink } from 'react-router-dom';
import { FileText, FilePlus2, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Rol } from '@/shared/auth/auth-context';

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  roles?: Rol[];
}

const NAV: NavItem[] = [
  { title: 'Actas y acuerdos', to: '/app', icon: FileText },
  { title: 'Crear acta', to: '/app/actas/nueva', icon: FilePlus2, roles: ['convocador'] },
  { title: 'Usuarios y roles', to: '/app/usuarios', icon: Users, roles: ['superadmin', 'admin'] },
];

export function AppSidebar({ rol }: { rol: Rol | null }) {
  const visible = NAV.filter((item) => !item.roles || (rol && item.roles.includes(rol)));

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">
          A
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-sidebar-foreground">Actas</p>
          <p className="text-xs text-sidebar-foreground/70">Gestión institucional</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
