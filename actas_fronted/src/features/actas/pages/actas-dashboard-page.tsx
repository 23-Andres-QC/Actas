import { Link } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import { useActas } from '../hooks/use-actas';
import { ActaCard } from '../components/acta-card';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../components/page-header';
import { useRol } from '../../../shared/auth/auth-context';

export function ActasDashboardPage() {
  const { data: actas, isLoading, isError } = useActas();
  const { esConvocador } = useRol();

  return (
    <section>
      <PageHeader
        title="Actas y acuerdos"
        description="Visualiza las actas registradas y el avance de sus acuerdos."
        action={
          esConvocador && (
            <Button asChild variant="hero">
              <Link to="/app/actas/nueva">
                <FilePlus2 className="size-4" /> Crear acta
              </Link>
            </Button>
          )
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm font-medium text-destructive">No se pudieron cargar las actas</p>}
      {!isLoading && !actas?.length && (
        <p className="text-sm text-muted-foreground">No hay actas registradas todavía.</p>
      )}

      <div className="space-y-3">
        {actas?.map((acta) => (
          <ActaCard key={acta.id} acta={acta} />
        ))}
      </div>
    </section>
  );
}
