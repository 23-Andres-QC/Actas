import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, FileSearch, Paperclip, PlusCircle, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SemaforoBadge } from '../../../components/status';
import { useAccionesPorAcuerdo, useActualizarCompletadaAccion, useEvidenciasAccion } from '../hooks/use-acuerdos';
import { Accion, Acuerdo } from '../types';
import { CrearAccionModal } from './crear-accion-modal';
import { EvidenciasAccionModal } from './evidencias-accion-modal';
import { EvidenciasAcuerdoModal } from './evidencias-acuerdo-modal';
import { IaAccionesModal } from './ia-acciones-modal';

function AccionItem({
  accion,
  onVerEvidencias,
  actualizarCompletada,
}: {
  accion: Accion;
  onVerEvidencias: (id: string) => void;
  actualizarCompletada: { mutate: (args: { id: string; completada: boolean }) => void; isPending: boolean };
}) {
  const { data: evidencias } = useEvidenciasAccion(accion.id);
  const conteoEvidencias = evidencias?.length ?? 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
      <button
        type="button"
        title={accion.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
        disabled={actualizarCompletada.isPending}
        onClick={() => actualizarCompletada.mutate({ id: accion.id, completada: !accion.completada })}
        className="shrink-0 disabled:opacity-50"
      >
        {accion.completada ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}
      </button>
      <span className={`min-w-0 flex-1 truncate ${accion.completada ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
        {accion.descripcion}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{new Date(accion.fechaFin).toLocaleDateString('es-PE')}</span>
      <button
        type="button"
        title={conteoEvidencias > 0 ? `Ver ${conteoEvidencias} evidencia(s)` : 'Ver evidencias'}
        onClick={() => onVerEvidencias(accion.id)}
        className="relative shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <FileSearch className="size-3.5" />
        {conteoEvidencias > 0 && (
          <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white">
            {conteoEvidencias}
          </span>
        )}
      </button>
    </div>
  );
}

export function AcuerdoRow({ acuerdo }: { acuerdo: Acuerdo }) {
  const [expandida, setExpandida] = useState(false);
  const [mostrarCrearAccion, setMostrarCrearAccion] = useState(false);
  const [mostrarIaAcciones, setMostrarIaAcciones] = useState(false);
  const [mostrarEvidenciasAcuerdo, setMostrarEvidenciasAcuerdo] = useState(false);
  const [accionEvidencias, setAccionEvidencias] = useState<string | null>(null);
  const { data: acciones, isLoading: cargandoAcciones } = useAccionesPorAcuerdo(expandida ? acuerdo.id : '');
  const actualizarCompletada = useActualizarCompletadaAccion(acuerdo.id);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setExpandida((v) => !v)}
          title={expandida ? 'Ocultar acciones' : 'Mostrar acciones'}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronDown className={`size-4 transition-transform ${expandida ? 'rotate-180' : ''}`} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{acuerdo.descripcion}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {acuerdo.responsableNombre ?? 'Sin responsable'} · vence {new Date(acuerdo.fechaFin).toLocaleDateString('es-PE')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setMostrarEvidenciasAcuerdo(true)}>
            <FileSearch className="size-3.5" /> Ver
          </Button>
          <span
            title={acuerdo.tieneEvidencias ? 'Tiene evidencias subidas' : 'Sin evidencias'}
            className={acuerdo.tieneEvidencias ? 'text-success' : 'text-muted-foreground/40'}
          >
            <Paperclip className="size-4" />
          </span>
          <SemaforoBadge estado={acuerdo.estadoSemaforo} />
          <span className="text-sm font-bold text-foreground">{acuerdo.porcentajeAvance}%</span>
        </div>
      </div>

      {expandida && (
        <div className="border-t bg-muted/15 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarIaAcciones(true)}
                className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Sparkles className="size-3.5" /> Sugerir con IA
              </button>
              <button
                type="button"
                onClick={() => setMostrarCrearAccion(true)}
                className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <PlusCircle className="size-3.5" /> Agregar acción
              </button>
            </div>
          </div>

          {cargandoAcciones && <div className="h-10 animate-pulse rounded-lg border bg-card" />}
          {!cargandoAcciones && !acciones?.length && (
            <p className="rounded-lg border border-dashed bg-card/70 p-3 text-center text-xs text-muted-foreground">Sin acciones registradas.</p>
          )}
          {!!acciones?.length && (
            <div className="space-y-1.5">
              {acciones.map((accion) => (
                <AccionItem
                  key={accion.id}
                  accion={accion}
                  onVerEvidencias={setAccionEvidencias}
                  actualizarCompletada={actualizarCompletada}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {mostrarCrearAccion && <CrearAccionModal acuerdoId={acuerdo.id} onClose={() => setMostrarCrearAccion(false)} />}
      {mostrarIaAcciones && (
        <IaAccionesModal
          acuerdoId={acuerdo.id}
          acuerdoDescripcion={acuerdo.descripcion}
          accionesExistentes={acciones ?? []}
          onClose={() => setMostrarIaAcciones(false)}
        />
      )}
      {mostrarEvidenciasAcuerdo && <EvidenciasAcuerdoModal acuerdoId={acuerdo.id} onClose={() => setMostrarEvidenciasAcuerdo(false)} />}
      {accionEvidencias && <EvidenciasAccionModal accionId={accionEvidencias} onClose={() => setAccionEvidencias(null)} />}
    </div>
  );
}
