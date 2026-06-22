import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, FileSearch, PlusCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SemaforoBadge } from '../../../components/status';
import { useAccionesPorAcuerdo, useActualizarCompletadaAccion } from '../hooks/use-acuerdos';
import { Acuerdo } from '../types';
import { CrearAccionModal } from './crear-accion-modal';
import { EvidenciasAccionModal } from './evidencias-accion-modal';
import { EvidenciasAcuerdoModal } from './evidencias-acuerdo-modal';

export function AcuerdoRow({ acuerdo }: { acuerdo: Acuerdo }) {
  const [expandida, setExpandida] = useState(false);
  const [mostrarCrearAccion, setMostrarCrearAccion] = useState(false);
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
          <SemaforoBadge estado={acuerdo.estadoSemaforo} />
          <span className="text-sm font-bold text-foreground">{acuerdo.porcentajeAvance}%</span>
        </div>
      </div>

      {expandida && (
        <div className="border-t bg-muted/15 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</p>
            <button
              type="button"
              onClick={() => setMostrarCrearAccion(true)}
              className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <PlusCircle className="size-3.5" /> Agregar acción
            </button>
          </div>

          {cargandoAcciones && <div className="h-10 animate-pulse rounded-lg border bg-card" />}
          {!cargandoAcciones && !acciones?.length && (
            <p className="rounded-lg border border-dashed bg-card/70 p-3 text-center text-xs text-muted-foreground">Sin acciones registradas.</p>
          )}
          {!!acciones?.length && (
            <div className="space-y-1.5">
              {acciones.map((accion) => (
                <div key={accion.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
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
                    title="Ver evidencias"
                    onClick={() => setAccionEvidencias(accion.id)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <FileSearch className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mostrarCrearAccion && <CrearAccionModal acuerdoId={acuerdo.id} onClose={() => setMostrarCrearAccion(false)} />}
      {mostrarEvidenciasAcuerdo && <EvidenciasAcuerdoModal acuerdoId={acuerdo.id} onClose={() => setMostrarEvidenciasAcuerdo(false)} />}
      {accionEvidencias && <EvidenciasAccionModal accionId={accionEvidencias} onClose={() => setAccionEvidencias(null)} />}
    </div>
  );
}
