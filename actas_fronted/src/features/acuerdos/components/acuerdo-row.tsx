import { useState } from 'react';
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Circle,
  FileSearch, Paperclip, Pencil, PlusCircle, Sparkles, User,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { SemaforoBadge } from '../../../components/status';
import {
  useAccionesPorAcuerdo, useActualizarCompletadaAccion,
  useEvidenciasAccion, useReordenarAcciones,
} from '../hooks/use-acuerdos';
import { Accion, Acuerdo } from '../types';
import { CrearAccionModal } from './crear-accion-modal';
import { EditarAccionModal } from './editar-accion-modal';
import { EditarAcuerdoModal } from './editar-acuerdo-modal';
import { EvidenciasAccionModal } from './evidencias-accion-modal';
import { EvidenciasAcuerdoModal } from './evidencias-acuerdo-modal';
import { IaAccionesModal } from './ia-acciones-modal';

function ReordenarBotones({
  onMoverArriba,
  onMoverAbajo,
  isFirst,
  isLast,
  size = 'sm',
}: {
  onMoverArriba?: () => void;
  onMoverAbajo?: () => void;
  isFirst: boolean;
  isLast: boolean;
  size?: 'sm' | 'xs';
}) {
  if (!onMoverArriba && !onMoverAbajo) return null;
  const iconSize = size === 'xs' ? 'size-3' : 'size-3.5';
  return (
    <div className="flex shrink-0 flex-col">
      <button
        type="button"
        onClick={onMoverArriba}
        disabled={isFirst}
        title="Mover arriba"
        className="rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
      >
        <ChevronUp className={iconSize} />
      </button>
      <button
        type="button"
        onClick={onMoverAbajo}
        disabled={isLast}
        title="Mover abajo"
        className="rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}

function AccionItem({
  accion,
  acuerdoId,
  isFirst,
  isLast,
  onMoverArriba,
  onMoverAbajo,
  onVerEvidencias,
  actualizarCompletada,
}: {
  accion: Accion;
  acuerdoId: string;
  isFirst: boolean;
  isLast: boolean;
  onMoverArriba: () => void;
  onMoverAbajo: () => void;
  onVerEvidencias: (id: string) => void;
  actualizarCompletada: { mutate: (args: { id: string; completada: boolean }) => void; isPending: boolean };
}) {
  const { data: evidencias } = useEvidenciasAccion(accion.id);
  const conteoEvidencias = evidencias?.length ?? 0;
  const [editando, setEditando] = useState(false);

  return (
    <>
      <div className="group flex items-start gap-2.5 rounded-lg bg-card/70 px-2.5 py-2 transition-colors hover:bg-secondary/50">
        <div className="mt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <ReordenarBotones onMoverArriba={onMoverArriba} onMoverAbajo={onMoverAbajo} isFirst={isFirst} isLast={isLast} size="xs" />
        </div>

        {/* Completada */}
        <button
          type="button"
          title={accion.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
          disabled={actualizarCompletada.isPending}
          onClick={() => actualizarCompletada.mutate({ id: accion.id, completada: !accion.completada })}
          className="mt-0.5 shrink-0 disabled:opacity-50"
        >
          {accion.completada
            ? <CheckCircle2 className="size-4 text-success" />
            : <Circle className="size-4 text-muted-foreground/40" />}
        </button>

        {/* Chip + descripción: el texto nunca se trunca, la fila crece hacia abajo si la descripción es larga */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="accent" className="px-1.5 py-0 text-[9px] uppercase tracking-wider">Acción</Badge>
            <span className={`break-words text-sm ${accion.completada ? 'text-muted-foreground' : 'text-foreground'}`}>
              {accion.descripcion}
            </span>
          </div>
        </div>

        {/* Fecha */}
        <span className="mt-0.5 hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
          <CalendarDays className="size-3" />
          {new Date(accion.fechaFin).toLocaleDateString('es-PE')}
        </span>

        {/* Acciones */}
        <div className="mt-0.5 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Editar acción"
            onClick={() => setEditando(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            title={conteoEvidencias > 0 ? `Ver ${conteoEvidencias} evidencia(s)` : 'Ver evidencias'}
            onClick={() => onVerEvidencias(accion.id)}
            className="relative rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FileSearch className="size-3.5" />
            {conteoEvidencias > 0 && (
              <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-success text-[9px] font-bold text-success-foreground">
                {conteoEvidencias}
              </span>
            )}
          </button>
        </div>
      </div>

      {editando && (
        <EditarAccionModal accion={accion} acuerdoId={acuerdoId} onClose={() => setEditando(false)} />
      )}
    </>
  );
}

interface AcuerdoRowProps {
  acuerdo: Acuerdo;
  actaId?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onMoverArriba?: () => void;
  onMoverAbajo?: () => void;
}

export function AcuerdoRow({ acuerdo, actaId, isFirst, isLast, onMoverArriba, onMoverAbajo }: AcuerdoRowProps) {
  const [expandida, setExpandida] = useState(false);
  const [mostrarCrearAccion, setMostrarCrearAccion] = useState(false);
  const [mostrarIaAcciones, setMostrarIaAcciones] = useState(false);
  const [mostrarEditarAcuerdo, setMostrarEditarAcuerdo] = useState(false);
  const [mostrarEvidenciasAcuerdo, setMostrarEvidenciasAcuerdo] = useState(false);
  const [accionEvidencias, setAccionEvidencias] = useState<string | null>(null);

  const { data: acciones, isLoading: cargandoAcciones } = useAccionesPorAcuerdo(expandida ? acuerdo.id : '');
  const actualizarCompletada = useActualizarCompletadaAccion(acuerdo.id);
  const reordenarAcciones = useReordenarAcciones(acuerdo.id);

  const [ordenLocal, setOrdenLocal] = useState<Accion[] | null>(null);
  const listaAcciones = ordenLocal ?? acciones ?? [];

  const moverAccion = (index: number, direccion: 'arriba' | 'abajo') => {
    const lista = [...listaAcciones] as Accion[];
    const otro = direccion === 'arriba' ? index - 1 : index + 1;
    const tmp = lista[index]!;
    lista[index] = lista[otro]!;
    lista[otro] = tmp;
    setOrdenLocal(lista);
    reordenarAcciones.mutate(lista.map((a, i) => ({ id: a.id, orden: i })));
  };

  // Reset orden local cuando se actualicen las acciones del servidor
  const handleExpandir = (v: boolean) => {
    setExpandida(v);
    if (!v) setOrdenLocal(null);
  };

  const totalAcciones = listaAcciones.length;
  const completadas = listaAcciones.filter((a) => a.completada).length;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-soft">
      {/* Acento de jerarquía: Acuerdo */}
      <div className="flex border-l-[3px] border-l-primary">
        <div className="flex w-full flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <ReordenarBotones onMoverArriba={onMoverArriba} onMoverAbajo={onMoverAbajo} isFirst={!!isFirst} isLast={!!isLast} />

          {/* Expandir */}
          <button
            type="button"
            onClick={() => handleExpandir(!expandida)}
            title={expandida ? 'Ocultar acciones' : 'Mostrar acciones'}
            className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronDown className={`size-4 transition-transform ${expandida ? 'rotate-180' : ''}`} />
          </button>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Badge className="px-1.5 py-0 text-[9px] uppercase tracking-wider">Acuerdo</Badge>
              {totalAcciones > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  {completadas}/{totalAcciones} acciones
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm font-medium text-foreground">{acuerdo.descripcion}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3" />
                {acuerdo.responsableNombre ?? 'Sin responsable'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                vence {new Date(acuerdo.fechaFin).toLocaleDateString('es-PE')}
              </span>
            </div>
          </div>

          {/* Estado y acciones */}
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMostrarEvidenciasAcuerdo(true)} className="h-7 px-2 text-xs">
              <FileSearch className="size-3" /> Ver
            </Button>
            <span
              title={acuerdo.tieneEvidencias ? 'Tiene evidencias subidas' : 'Sin evidencias'}
              className={acuerdo.tieneEvidencias ? 'text-success' : 'text-muted-foreground/30'}
            >
              <Paperclip className="size-3.5" />
            </span>
            <SemaforoBadge estado={acuerdo.estadoSemaforo} />
            <span className="min-w-[2.5rem] text-right text-sm font-bold text-primary">{acuerdo.porcentajeAvance}%</span>
            <button
              type="button"
              title="Editar acuerdo"
              onClick={() => setMostrarEditarAcuerdo(true)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sección de acciones: indentada y conectada visualmente al acuerdo padre */}
      {expandida && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="ml-2 border-l-2 border-dashed border-accent/50 pl-4 sm:ml-9">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acciones</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarIaAcciones(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                >
                  <Sparkles className="size-3" /> Sugerir con IA
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarCrearAccion(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <PlusCircle className="size-3" /> Agregar
                </button>
              </div>
            </div>

            {cargandoAcciones && <div className="h-8 animate-pulse rounded-lg border bg-card" />}
            {!cargandoAcciones && !listaAcciones.length && (
              <p className="rounded-lg border border-dashed border-border bg-card/70 p-3 text-center text-xs text-muted-foreground">
                Sin acciones registradas.
              </p>
            )}
            {listaAcciones.length > 0 && (
              <div className="space-y-1">
                {listaAcciones.map((accion, i) => (
                  <AccionItem
                    key={accion.id}
                    accion={accion}
                    acuerdoId={acuerdo.id}
                    isFirst={i === 0}
                    isLast={i === listaAcciones.length - 1}
                    onMoverArriba={() => moverAccion(i, 'arriba')}
                    onMoverAbajo={() => moverAccion(i, 'abajo')}
                    onVerEvidencias={setAccionEvidencias}
                    actualizarCompletada={actualizarCompletada}
                  />
                ))}
              </div>
            )}
          </div>
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
      {mostrarEditarAcuerdo && (
        <EditarAcuerdoModal acuerdo={acuerdo} actaId={actaId ?? acuerdo.actaId} onClose={() => setMostrarEditarAcuerdo(false)} />
      )}
      {mostrarEvidenciasAcuerdo && <EvidenciasAcuerdoModal acuerdoId={acuerdo.id} onClose={() => setMostrarEvidenciasAcuerdo(false)} />}
      {accionEvidencias && <EvidenciasAccionModal accionId={accionEvidencias} onClose={() => setAccionEvidencias(null)} />}
    </div>
  );
}
