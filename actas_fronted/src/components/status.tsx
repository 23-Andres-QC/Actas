import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

const SEMAFORO_VARIANT: Record<Semaforo, 'success' | 'warning' | 'destructive'> = {
  verde: 'success',
  amarillo: 'warning',
  rojo: 'destructive',
};

export function SemaforoBadge({ estado }: { estado: Semaforo }) {
  return <Badge variant={SEMAFORO_VARIANT[estado]}>{estado}</Badge>;
}

export function SemaforoDot({ semaforo, label }: { semaforo: Semaforo; label?: string }) {
  const color = semaforo === 'verde' ? 'bg-success' : semaforo === 'amarillo' ? 'bg-warning' : 'bg-destructive';
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('size-3 rounded-full shadow-sm ring-2 ring-background', color)} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-success' : value >= 40 ? 'bg-accent' : 'bg-warning';
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
    </div>
  );
}
