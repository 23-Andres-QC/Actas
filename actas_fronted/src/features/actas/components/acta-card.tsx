import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { ProgressBar } from '../../../components/status';
import { Acta } from '../types';

export function ActaCard({ acta }: { acta: Acta }) {
  return (
    <Link to={`/app/actas/${acta.id}`}>
      <Card className="flex flex-wrap items-center gap-4 p-5 transition-colors hover:bg-secondary/40">
        <div className="min-w-[220px] flex-1">
          <h3 className="font-display text-lg font-semibold">{acta.titulo}</h3>
          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" /> {new Date(acta.fecha).toLocaleDateString()}
          </span>
        </div>
        <div className="w-40">
          <div className="mb-1 flex justify-between text-xs">
            <span>Avance</span>
            <span className="font-semibold">{acta.porcentajeAvance}%</span>
          </div>
          <ProgressBar value={acta.porcentajeAvance} />
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Card>
    </Link>
  );
}
