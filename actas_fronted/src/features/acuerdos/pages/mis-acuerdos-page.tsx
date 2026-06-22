import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, ExternalLink, Loader2, Paperclip } from 'lucide-react';
import { useAcuerdosMios, usePriorizarAcuerdos, type PriorizacionItem } from '../hooks/use-acuerdos';
import { MiAcuerdo } from '../types';
import { SemaforoBadge, ProgressBar } from '../../../components/status';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../components/page-header';

const PRIORIDAD_COLOR: Record<PriorizacionItem['prioridad'], string> = {
  alta: 'border-destructive/40 bg-destructive/5 text-destructive',
  media: 'border-warning/40 bg-warning/5 text-warning',
  baja: 'border-success/40 bg-success/5 text-success',
};

const PRIORIDAD_LABEL: Record<PriorizacionItem['prioridad'], string> = {
  alta: 'Prioridad alta',
  media: 'Prioridad media',
  baja: 'Prioridad baja',
};

export function MisAcuerdosPage() {
  const { data: acuerdos, isLoading, isError } = useAcuerdosMios();
  const priorizar = usePriorizarAcuerdos();
  const [priorizacion, setPriorizacion] = useState<{ mensaje: string; priorizacion: PriorizacionItem[] } | null>(null);

  const handlePriorizar = () => {
    if (!acuerdos?.length) return;
    priorizar.mutate(acuerdos, {
      onSuccess: (data) => setPriorizacion(data),
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border bg-card" />;
  if (isError) return <Card className="p-8 text-center text-sm font-medium text-destructive">No se pudieron cargar tus compromisos.</Card>;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Mis compromisos"
          description="Acuerdos donde eres responsable"
        />
        {!!acuerdos?.length && (
          <Button
            variant="outline"
            onClick={handlePriorizar}
            disabled={priorizar.isPending}
            className="gap-2 self-start"
          >
            {priorizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
            {priorizar.isPending ? 'Analizando...' : '¿Qué priorizo esta semana?'}
          </Button>
        )}
      </div>

      {priorizacion && (
        <Card className="space-y-4 p-5">
          <div className="flex items-start gap-2">
            <BrainCircuit className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-primary">Recomendación IA</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{priorizacion.mensaje}</p>
            </div>
          </div>
          <div className="space-y-2">
            {priorizacion.priorizacion.map((item) => {
              const acuerdo = acuerdos?.find((a) => a.id === item.acuerdoId);
              return (
                <div key={item.acuerdoId} className={`rounded-xl border px-3 py-2.5 ${PRIORIDAD_COLOR[item.prioridad]}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{PRIORIDAD_LABEL[item.prioridad]}</span>
                    <span className="text-xs opacity-70">{acuerdo?.actaTitulo}</span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium">{acuerdo?.descripcion}</p>
                  <p className="mt-1 text-xs opacity-80">{item.razon}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!acuerdos?.length ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No tienes compromisos asignados actualmente.
        </Card>
      ) : (
        <div className="space-y-3">
          {acuerdos.map((acuerdo) => (
            <AcuerdoCard key={acuerdo.id} acuerdo={acuerdo} />
          ))}
        </div>
      )}
    </section>
  );
}

function AcuerdoCard({ acuerdo }: { acuerdo: MiAcuerdo }) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{acuerdo.actaTitulo}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{acuerdo.descripcion}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vence: {new Date(acuerdo.fechaFin).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {acuerdo.tieneEvidencias && (
            <span title="Tiene evidencias subidas" className="text-success">
              <Paperclip className="size-4" />
            </span>
          )}
          <SemaforoBadge estado={acuerdo.estadoSemaforo} />
          <span className="text-sm font-bold">{acuerdo.porcentajeAvance}%</span>
          <Link
            to={`/app/actas/${acuerdo.actaId}`}
            title="Ver acta"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
      <ProgressBar value={acuerdo.porcentajeAvance} />
    </Card>
  );
}
