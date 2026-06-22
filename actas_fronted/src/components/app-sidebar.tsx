import { NavLink } from 'react-router-dom';
import { Building2, ClipboardCheck, FileText, FilePlus2, Users, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Rol } from '@/shared/auth/auth-context';

interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  roles?: Rol[];
  allowJefe?: boolean;
}

const NAV: NavItem[] = [
  { title: 'Actas y acuerdos', to: '/app', icon: FileText },
  { title: 'Mis compromisos', to: '/app/mis-compromisos', icon: ClipboardCheck },
  { title: 'Crear acta', to: '/app/actas/nueva', icon: FilePlus2, roles: ['superadmin', 'convocador'] },
  { title: 'Usuarios y roles', to: '/app/usuarios', icon: Users, roles: ['superadmin'], allowJefe: true },
  { title: 'Áreas', to: '/app/areas', icon: Building2, roles: ['superadmin'] },
];

interface AppSidebarProps {
  rol: Rol | null;
  esJefe: boolean;
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ rol, esJefe, open, onClose }: AppSidebarProps) {
  const visible = NAV.filter((item) => {
    if (!item.roles) return true;
    if (rol && item.roles.includes(rol)) return true;
    if (item.allowJefe && esJefe) return true;
    return false;
  });

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Cerrar navegación"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent/40 p-1.5 shadow-lg shadow-cyan-950/20">
            <img src="/logo1.png" alt="ComprometIA" className="size-full object-contain" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-base font-bold text-sidebar-foreground">ComprometIA</p>
            <p className="truncate text-xs text-sidebar-foreground/65">Gestión institucional</p>
          </div>
          <button
            className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            onClick={onClose}
            aria-label="Cerrar navegación"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-4 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
          Navegación
        </div>
        <nav className="flex-1 space-y-1.5 px-3">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <item.icon className="size-4 transition-transform group-hover:scale-110" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
          <p className="text-xs font-semibold text-sidebar-foreground">Seguimiento centralizado</p>
          <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
            Actas, compromisos y evidencias en un solo lugar.
          </p>
        </div>
      </aside>
    </>
  );
}
