import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, ClipboardList, FilePlus2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useActas } from '../hooks/use-actas';
import { ActaCard } from '../components/acta-card';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { PageHeader } from '../../../components/page-header';
import { useRol } from '../../../shared/auth/auth-context';

export function ActasDashboardPage() {
  const { data: actas, isLoading, isError } = useActas();
  const { esConvocador, esSuperAdmin } = useRol();
  const [search, setSearch] = useState('');

  const filteredActas = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    if (!query) return actas ?? [];
    return (actas ?? []).filter((acta) =>
      [acta.titulo, acta.lugar, acta.proceso].some((value) => value?.toLocaleLowerCase('es').includes(query)),
    );
  }, [actas, search]);

  const average = actas?.length
    ? Math.round(actas.reduce((total, acta) => total + acta.porcentajeAvance, 0) / actas.length)
    : 0;
  const completed = actas?.filter((acta) => acta.porcentajeAvance >= 100).length ?? 0;

  return (
    <section>
      <PageHeader
        eyebrow="Panel institucional"
        title="Actas y acuerdos"
        description="Consulta el avance de los compromisos y accede al historial de cada reunión."
        action={
          (esConvocador || esSuperAdmin) && (
            <Button asChild variant="hero" size="lg">
              <Link to="/app/actas/nueva">
                <FilePlus2 className="size-4" /> Crear acta
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <MetricCard icon={ClipboardList} label="Actas registradas" value={actas?.length ?? 0} tone="primary" />
        <MetricCard icon={Activity} label="Avance promedio" value={`${average}%`} tone="accent" />
        <MetricCard icon={CheckCircle2} label="Actas completadas" value={completed} tone="success" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Registro de actas</h2>
          <p className="text-sm text-muted-foreground">{filteredActas.length} resultado{filteredActas.length === 1 ? '' : 's'}</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, lugar o proceso"
            className="bg-card pl-9"
            aria-label="Buscar actas"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3" aria-label="Cargando actas">
          {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border bg-card/70" />)}
        </div>
      )}

      {isError && (
        <Card className="border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="font-semibold text-destructive">No pudimos cargar las actas</p>
          <p className="mt-1 text-sm text-muted-foreground">Comprueba tu conexión e intenta nuevamente.</p>
        </Card>
      )}

      {!isLoading && !isError && !actas?.length && (
        <Card className="border-dashed p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
            <ClipboardList className="size-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">Aún no hay actas registradas</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Las actas creadas aparecerán aquí con su avance y datos principales.</p>
        </Card>
      )}

      {!isLoading && !isError && !!actas?.length && !filteredActas.length && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">No encontramos actas que coincidan con “{search}”.</Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredActas.map((acta) => <ActaCard key={acta.id} acta={acta} />)}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof ClipboardList; label: string; value: string | number; tone: 'primary' | 'accent' | 'success' }) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/15 text-accent-foreground',
    success: 'bg-success/10 text-success',
  }[tone];

  return (
    <Card className="flex items-center gap-4 border-border/70 p-5 shadow-card">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClass}`}><Icon className="size-5" /></span>
      <div>
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
