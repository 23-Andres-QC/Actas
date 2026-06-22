import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { actasApi } from '../api/actas.api';
import { Card } from '../../../components/ui/card';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DocEditorInstance = { destroyEditor: () => void } & Record<string, any>;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DocsAPI?: { DocEditor: new (elementId: string, config: any) => DocEditorInstance };
  }
}

const EDITOR_ELEMENT_ID = 'onlyoffice-editor';

function cargarScriptOnlyOffice(documentServerUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.DocsAPI) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `${documentServerUrl}/web-apps/apps/api/documents/api.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el editor de OnlyOffice.'));
    document.body.appendChild(script);
  });
}

export function EditarActaPage() {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const editorRef = useRef<DocEditorInstance | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;

    (async () => {
      try {
        const { documentServerUrl, config } = await actasApi.obtenerDocumentoEditable(id);
        if (!documentServerUrl) {
          throw new Error('El editor de documentos no está configurado en este servidor.');
        }
        await cargarScriptOnlyOffice(documentServerUrl);
        if (!activo || !window.DocsAPI) return;
        editorRef.current = new window.DocsAPI.DocEditor(EDITOR_ELEMENT_ID, config);
        setCargando(false);
      } catch (err) {
        if (!activo) return;
        setError(err instanceof Error ? err.message : 'No se pudo abrir el editor del acta.');
        setCargando(false);
      }
    })();

    return () => {
      activo = false;
      editorRef.current?.destroyEditor();
      editorRef.current = null;
    };
  }, [id]);

  return (
    <section className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col">
      <div className="mb-3 flex items-center justify-between">
        <Link to={`/app/actas/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Volver al acta
        </Link>
        <h1 className="font-display text-lg font-bold tracking-tight">Editar acta</h1>
      </div>

      {error && <Card className="p-8 text-center text-sm font-medium text-destructive">{error}</Card>}

      {!error && (
        <div className="relative flex-1 overflow-hidden rounded-2xl border bg-card">
          {cargando && (
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-card text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando editor...
            </div>
          )}
          <div id={EDITOR_ELEMENT_ID} className="size-full" />
        </div>
      )}
    </section>
  );
}
