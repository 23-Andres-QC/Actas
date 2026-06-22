import { FormEvent, useRef, useState } from 'react';
import { File as FileIcon, Link as LinkIcon, Loader2, Upload, X } from 'lucide-react';
import { useEvidenciasAccion, useSubirEvidenciaAccion, useSubirEvidenciaAccionLink } from '../hooks/use-acuerdos';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export function EvidenciasAccionModal({ accionId, onClose }: { accionId: string; onClose: () => void }) {
  const { data: evidencias, isLoading } = useEvidenciasAccion(accionId);
  const subirArchivo = useSubirEvidenciaAccion(accionId);
  const subirLink = useSubirEvidenciaAccionLink(accionId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modo, setModo] = useState<'archivo' | 'link'>('archivo');
  const [url, setUrl] = useState('');

  const handleSubmitLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    await subirLink.mutateAsync(url.trim());
    setUrl('');
  };

  const pendiente = subirArchivo.isPending || subirLink.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Evidencias de la acción</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {!isLoading && !evidencias?.length && <p className="text-sm text-muted-foreground">Aún no hay evidencias subidas.</p>}
        {!!evidencias?.length && (
          <ul className="divide-y rounded-xl border">
            {evidencias.map((ev) => (
              <li key={ev.id} className="flex items-center gap-2 p-3 text-sm">
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

        <div className="border-t pt-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setModo('archivo')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${modo === 'archivo' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setModo('link')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${modo === 'link' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              Pegar link
            </button>
          </div>

          {modo === 'archivo' ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) subirArchivo.mutate(archivo);
                  e.target.value = '';
                }}
              />
              <Button type="button" variant="outline" disabled={pendiente} onClick={() => fileInputRef.current?.click()}>
                {pendiente ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {pendiente ? 'Subiendo...' : 'Seleccionar archivo'}
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmitLink} className="flex gap-2">
              <Input type="url" placeholder="https://docs.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} required />
              <Button type="submit" disabled={pendiente}>
                {pendiente ? <Loader2 className="size-4 animate-spin" /> : 'Agregar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
