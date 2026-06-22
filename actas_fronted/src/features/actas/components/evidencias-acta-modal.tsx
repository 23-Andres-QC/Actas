import { FormEvent, useRef, useState } from 'react';
import { File as FileIcon, Link as LinkIcon, Loader2, Upload, X } from 'lucide-react';
import { useEvidenciasActa, useSubirEvidenciaActa, useSubirEvidenciaActaLink } from '../hooks/use-actas';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export function EvidenciasActaModal({ actaId, onClose }: { actaId: string; onClose: () => void }) {
  const { data: evidencias, isLoading } = useEvidenciasActa(actaId);
  const subirArchivo = useSubirEvidenciaActa(actaId);
  const subirLink = useSubirEvidenciaActaLink(actaId);
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
  const error = subirArchivo.error ?? subirLink.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl bg-card p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Evidencias del acta</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Documentos, fotos o enlaces relacionados con la reunión, distintos al acta física oficial.
        </p>

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
              <p className="mt-2 text-[11px] text-muted-foreground">
                Documentos, imágenes, PDF, video o comprimidos. Máximo 25MB. Si tu archivo no está permitido, usa "Pegar link" con un enlace de Drive/OneDrive.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmitLink} className="flex gap-2">
              <Input type="url" placeholder="https://docs.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} required />
              <Button type="submit" disabled={pendiente}>
                {pendiente ? <Loader2 className="size-4 animate-spin" /> : 'Agregar'}
              </Button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              {error instanceof Error ? error.message : 'No se pudo subir la evidencia.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
