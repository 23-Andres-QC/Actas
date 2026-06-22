import { useState } from 'react';
import {
  CheckCircle2, ChevronDown, ChevronUp, Circle,
  FileSearch, Paperclip, Pencil, PlusCircle, Sparkles,
} from 'lucide-react';
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
      <div className="group flex items-center gap-2 rounded-lg border-l-2 border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50/80">
        {/* Reordenar */}
        <div className="flex shrink-0 flex-col opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onMoverArriba}
            disabled={isFirst}
            title="Mover arriba"
            className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            onClick={onMoverAbajo}
            disabled={isLast}
            title="Mover abajo"
            className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>

        {/* Completada */}
        <button
          type="button"
          title={accion.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
          disabled={actualizarCompletada.isPending}
          onClick={() => actualizarCompletada.mutate({ id: accion.id, completada: !accion.completada })}
          className="shrink-0 disabled:opacity-50"
        >
          {accion.completada
            ? <CheckCircle2 className="size-4 text-success" />
            : <Circle className="size-4 text-slate-300" />}
        </button>

        {/* Chip + descripción */}
        <div className="min-w-0 flex-1">
          <span className="mr-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">ACCIÓN</span>
          <span className={`text-sm ${accion.completada ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {accion.descripcion}
          </span>
        </div>

        {/* Fecha */}
        <span className="shrink-0 text-xs text-slate-400">
          {new Date(accion.fechaFin).toLocaleDateString('es-PE')}
        </span>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Editar acción"
            onClick={() => setEditando(true)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            title={conteoEvidencias > 0 ? `Ver ${conteoEvidencias} evidencia(s)` : 'Ver evidencias'}
            onClick={() => onVerEvidencias(accion.id)}
            className="relative rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <FileSearch className="size-3.5" />
            {conteoEvidencias > 0 && (
              <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white">
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header del acuerdo */}
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
        {/* Reordenar acuerdo */}
        {(onMoverArriba || onMoverAbajo) && (
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoverArriba}
              disabled={isFirst}
              title="Mover arriba"
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-20"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={onMoverAbajo}
              disabled={isLast}
              title="Mover abajo"
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-20"
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        )}

        {/* Expandir */}
        <button
          type="button"
          onClick={() => handleExpandir(!expandida)}
          title={expandida ? 'Ocultar acciones' : 'Mostrar acciones'}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronDown className={`size-4 transition-transform ${expandida ? 'rotate-180' : ''}`} />
        </button>

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ACUERDO</p>
          <p className="mt-0.5 text-sm font-medium text-slate-800">{acuerdo.descripcion}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {acuerdo.responsableNombre ?? 'Sin responsable'} · vence {new Date(acuerdo.fechaFin).toLocaleDateString('es-PE')}
          </p>
        </div>

        {/* Estado y acciones */}
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setMostrarEvidenciasAcuerdo(true)} className="h-7 px-2 text-xs">
            <FileSearch className="size-3" /> Ver
          </Button>
          <span
            title={acuerdo.tieneEvidencias ? 'Tiene evidencias subidas' : 'Sin evidencias'}
            className={acuerdo.tieneEvidencias ? 'text-success' : 'text-slate-200'}
          >
            <Paperclip className="size-3.5" />
          </span>
          <SemaforoBadge estado={acuerdo.estadoSemaforo} />
          <span className="min-w-[2.5rem] text-right text-sm font-bold text-slate-700">{acuerdo.porcentajeAvance}%</span>
          <button
            type="button"
            title="Editar acuerdo"
            onClick={() => setMostrarEditarAcuerdo(true)}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Sección de acciones */}
      {expandida && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ACCIONES</p>
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
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <PlusCircle className="size-3" /> Agregar
              </button>
            </div>
          </div>

          {cargandoAcciones && <div className="h-8 animate-pulse rounded-lg border bg-white" />}
          {!cargandoAcciones && !listaAcciones.length && (
            <p className="rounded-lg border border-dashed border-slate-200 bg-white/70 p-3 text-center text-xs text-slate-400">
              Sin acciones registradas.
            </p>
          )}
          {listaAcciones.length > 0 && (
            <div className="space-y-1.5 pl-2">
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
