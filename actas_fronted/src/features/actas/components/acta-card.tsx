import { Link } from 'react-router-dom';
import { CalendarDays, Eye, MapPin } from 'lucide-react';
import { Card } from '../../../components/ui/card';
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
    <Card className="flex h-full flex-col border-border/70 p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-soft sm:p-6">
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={completed ? 'success' : 'secondary'}>{completed ? 'Completada' : 'En seguimiento'}</Badge>
          <Badge variant="outline">{PROCESO_LABEL[acta.proceso]}</Badge>
        </div>
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-foreground">{acta.titulo}</h3>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {new Date(acta.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {acta.lugar && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {acta.lugar}</span>}
        </div>
        <div className="mt-5 border-t border-border/60 pt-4">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-medium text-muted-foreground">Avance general</span>
            <span className="font-semibold text-foreground">{acta.porcentajeAvance}%</span>
          </div>
          <ProgressBar value={acta.porcentajeAvance} />
        </div>
      </div>
      <Link
        to={`/app/actas/${acta.id}`}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Eye className="size-4" /> Ver acta virtual
      </Link>
    </Card>
  );
}
