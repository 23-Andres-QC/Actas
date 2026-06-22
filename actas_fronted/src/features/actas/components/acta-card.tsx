import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { ProgressBar } from '../../../components/status';
import { Acta } from '../types';

const PROCESO_LABEL: Record<Acta['proceso'], string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};

export function ActaCard({ acta }: { acta: Acta }) {
  const completed = acta.porcentajeAvance >= 100;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card px-5 py-4 shadow-card transition-all duration-200 hover:border-accent/50 hover:shadow-soft">
      {/* Badges */}
      <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
        <Badge variant={completed ? 'success' : 'secondary'} className="justify-center">
          {completed ? 'Completada' : 'En seguimiento'}
        </Badge>
        <Badge variant="outline" className="justify-center">
          {PROCESO_LABEL[acta.proceso]}
        </Badge>
      </div>

      {/* Info principal */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">{acta.titulo}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3 shrink-0" />
            {new Date(acta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate max-w-[140px]">{acta.lugar}</span>
          </span>
        </div>
      </div>

      {/* Avance */}
      <div className="hidden w-36 shrink-0 md:block">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted-foreground">Avance</span>
          <span className="font-semibold text-foreground">{acta.porcentajeAvance}%</span>
        </div>
        <ProgressBar value={acta.porcentajeAvance} />
      </div>

      {/* Acción */}
      <Link
        to={`/app/actas/${acta.id}`}
        className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Eye className="size-3.5" />
        <span className="hidden sm:inline">Ver acta</span>
        <ChevronRight className="size-3.5 sm:hidden" />
      </Link>
    </div>
  );
}
