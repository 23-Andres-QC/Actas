import { File as FileIcon, Link as LinkIcon, X } from 'lucide-react';
import { useAccionesPorAcuerdo, useEvidenciasAccion } from '../hooks/use-acuerdos';
import { Accion } from '../types';

export function EvidenciasAcuerdoModal({ acuerdoId, onClose }: { acuerdoId: string; onClose: () => void }) {
  const { data: acciones, isLoading } = useAccionesPorAcuerdo(acuerdoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Evidencias del acuerdo</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {!isLoading && !acciones?.length && <p className="text-sm text-muted-foreground">Este acuerdo todavía no tiene acciones registradas.</p>}
        {acciones?.map((accion) => <EvidenciasPorAccion key={accion.id} accion={accion} />)}
      </div>
    </div>
  );
}

function EvidenciasPorAccion({ accion }: { accion: Accion }) {
  const { data: evidencias, isLoading } = useEvidenciasAccion(accion.id);
  return (
    <div className="rounded-xl border p-3">
      <p className="text-sm font-medium text-foreground">{accion.descripcion}</p>
      {isLoading && <p className="mt-2 text-xs text-muted-foreground">Cargando...</p>}
      {!isLoading && !evidencias?.length && <p className="mt-2 text-xs text-muted-foreground">Sin evidencias subidas.</p>}
      {!!evidencias?.length && (
        <ul className="mt-2 divide-y rounded-lg border">
          {evidencias.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 p-2.5 text-sm">
              {ev.tipo === 'link' ? <LinkIcon className="size-4 shrink-0 text-primary" /> : <FileIcon className="size-4 shrink-0 text-muted-foreground" />}
              <a href={ev.urlArchivo} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary hover:underline">
                {ev.urlArchivo}
              </a>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(ev.fechaSubida).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
