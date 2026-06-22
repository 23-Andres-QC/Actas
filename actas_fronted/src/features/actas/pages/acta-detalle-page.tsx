import { Link, useParams } from 'react-router-dom';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ArrowLeft, Check, Download, FileCheck2, Link2, Loader2, PenLine, PlusCircle, QrCode, RefreshCw, Save, Upload, UserX } from 'lucide-react';
import { useActa } from '../hooks/use-actas';
import { CrearAcuerdoModal } from '../../acuerdos/components/crear-acuerdo-modal';
import { actasApi } from '../api/actas.api';
import { useInasistentes, useSubirEvidenciaInasistencia } from '../../asistencia/hooks/use-inasistentes';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useRol } from '../../../shared/auth/auth-context';
import { Inasistente } from '../../asistencia/types';
import { QrActaModal } from '../components/qr-acta-modal';

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

export function ActaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: acta, isLoading, isError } = useActa(id ?? '');
  const { esSuperAdmin, esAdmin, esConvocador } = useRol();
  const puedeVerInasistentes = esSuperAdmin || esAdmin || esConvocador;
  const [descargando, setDescargando] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);
  const [mostrarFormAcuerdo, setMostrarFormAcuerdo] = useState(false);
  const [actualizandoDocumento, setActualizandoDocumento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const editorActaRef = useRef<EditorActaHandle>(null);

  if (isLoading) return <div className="h-[70vh] animate-pulse rounded-2xl border bg-card" />;
  if (isError || !acta) return <Card className="p-8 text-center text-sm font-medium text-destructive">No se pudo cargar el acta.</Card>;

  const descargarWord = async () => {
    setDescargando(true);
    try {
      const blob = await actasApi.descargarWord(acta.id);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `acta-${acta.titulo.replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase()}.docx`;
      enlace.click();
      URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  };

  const guardarDocumento = async () => {
    setGuardando(true);
    setGuardado(false);
    try {
      await actasApi.guardarDocumentoEditable(acta.id);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/app" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Volver a actas
          </Link>
          <div className="flex items-center gap-2">
            <PenLine className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">Acta virtual</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Edición del documento oficial en tiempo real.</p>
          {acta.urlReunion && (
            <a
              href={acta.urlReunion}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Link2 className="size-4" /> Unirse a la reunión
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="hero"
            size="lg"
            className="gap-2"
            onClick={guardarDocumento}
            disabled={guardando}
            title="Guarda ya lo que hayas escrito a mano dentro del editor, sin esperar al autoguardado"
          >
            {guardando ? <Loader2 className="animate-spin" /> : guardado ? <Check /> : <Save />}
            {guardando ? 'Guardando...' : guardado ? 'Guardado' : 'Guardar'}
          </Button>
          <Button variant="outline" size="lg" onClick={descargarWord} disabled={descargando} className="gap-2">
            {descargando ? <Loader2 className="animate-spin" /> : <Download />}
            {descargando ? 'Preparando...' : 'Descargar Word'}
          </Button>
          <Button variant="outline" size="lg" onClick={() => setMostrarQr(true)} title="Ver QR de asistencia">
            <QrCode />
          </Button>
          <Button variant="outline" size="lg" onClick={() => setMostrarFormAcuerdo(true)} className="gap-2">
            <PlusCircle /> Agregar acuerdo
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => editorActaRef.current?.actualizar()}
            disabled={actualizandoDocumento}
            title="Reconstruye el documento con los acuerdos y firmas actuales (sobrescribe ediciones manuales)"
          >
            {actualizandoDocumento ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Actualizar documento
          </Button>
        </div>
      </div>
      {mostrarQr && <QrActaModal acta={acta} onClose={() => setMostrarQr(false)} />}
      {mostrarFormAcuerdo && <CrearAcuerdoModal actaId={acta.id} onClose={() => setMostrarFormAcuerdo(false)} />}

      <EditorActa ref={editorActaRef} actaId={acta.id} onActualizandoChange={setActualizandoDocumento} />

      {puedeVerInasistentes && <div className="mt-8"><InasistentesSection actaId={acta.id} puedeSubirEvidencia={esSuperAdmin || esAdmin} /></div>}
    </section>
  );
}

interface EditorActaHandle {
  actualizar: () => Promise<void>;
}

const EditorActa = forwardRef<EditorActaHandle, { actaId: string; onActualizandoChange: (actualizando: boolean) => void }>(
  function EditorActa({ actaId, onActualizandoChange }, ref) {
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const editorRef = useRef<DocEditorInstance | null>(null);
    const activoRef = useRef(true);

    const montarEditor = async (regenerar: boolean) => {
      try {
        const { documentServerUrl, config } = regenerar
          ? await actasApi.regenerarDocumentoEditable(actaId)
          : await actasApi.obtenerDocumentoEditable(actaId);
        if (!documentServerUrl) {
          throw new Error('El editor de documentos no está configurado en este servidor.');
        }
        await cargarScriptOnlyOffice(documentServerUrl);
        if (!activoRef.current || !window.DocsAPI) return;
        editorRef.current?.destroyEditor();
        editorRef.current = new window.DocsAPI.DocEditor(EDITOR_ELEMENT_ID, config);
        setError(null);
      } catch (err) {
        if (!activoRef.current) return;
        setError(err instanceof Error ? err.message : 'No se pudo abrir el editor del acta.');
      }
    };

    useEffect(() => {
      activoRef.current = true;
      setCargando(true);
      montarEditor(false).finally(() => setCargando(false));

      return () => {
        activoRef.current = false;
        editorRef.current?.destroyEditor();
        editorRef.current = null;
      };
    }, [actaId]);

    useImperativeHandle(ref, () => ({
      actualizar: async () => {
        setActualizando(true);
        onActualizandoChange(true);
        try {
          await montarEditor(true);
        } finally {
          setActualizando(false);
          onActualizandoChange(false);
        }
      },
    }));

    const mostrarOverlay = cargando || actualizando || !!error;

    return (
      <div className="relative h-[800px] overflow-hidden rounded-3xl border border-border/70 bg-card shadow-inner">
        {/*
          El div del editor nunca se desmonta ni el overlay se inserta/quita condicionalmente:
          OnlyOffice manipula el DOM interno por su cuenta, y si React intenta reconciliar
          (insertar/quitar) nodos hermanos de ese div después del montaje, crashea con
          "insertBefore: node is not a child of this node". Solo se alternan clases CSS.
        */}
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center gap-2 bg-card px-8 text-center text-sm transition-opacity ${
            mostrarOverlay ? 'opacity-100' : 'pointer-events-none opacity-0'
          } ${error ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {error ? (
            <span className="font-medium">{error}</span>
          ) : (
            <>
              <Loader2 className="size-4 animate-spin" /> {actualizando ? 'Actualizando documento...' : 'Cargando editor...'}
            </>
          )}
        </div>
        <div id={EDITOR_ELEMENT_ID} className="size-full" />
      </div>
    );
  },
);

function InasistentesSection({ actaId, puedeSubirEvidencia }: { actaId: string; puedeSubirEvidencia: boolean }) {
  const { data: inasistentes, isLoading, isError } = useInasistentes(actaId);
  return (
    <>
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><UserX className="size-5" /> Gestión de inasistencias</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm font-medium text-destructive">No se pudieron cargar los inasistentes.</p>}
      {!isLoading && !isError && !inasistentes?.length && <Card className="p-5 text-sm text-muted-foreground">Todos los miembros del área asistieron.</Card>}
      {!!inasistentes?.length && <Card><ul className="divide-y">{inasistentes.map((inasistente) => <InasistenteRow key={inasistente.usuarioId} actaId={actaId} inasistente={inasistente} puedeSubirEvidencia={puedeSubirEvidencia} />)}</ul></Card>}
    </>
  );
}

function InasistenteRow({ actaId, inasistente, puedeSubirEvidencia }: { actaId: string; inasistente: Inasistente; puedeSubirEvidencia: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subirEvidencia = useSubirEvidenciaInasistencia(actaId);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div><p className="text-sm font-medium">{inasistente.nombre}</p><p className="text-xs text-muted-foreground">{inasistente.email}</p></div>
      {inasistente.evidenciaUrl ? (
        <a href={inasistente.evidenciaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-success"><FileCheck2 className="size-4" /> Justificación subida</a>
      ) : puedeSubirEvidencia ? (
        <><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={(event) => { const archivo = event.target.files?.[0]; if (archivo) subirEvidencia.mutate({ usuarioId: inasistente.usuarioId, archivo }); }} /><Button variant="outline" size="sm" disabled={subirEvidencia.isPending} onClick={() => fileInputRef.current?.click()}><Upload /> {subirEvidencia.isPending ? 'Subiendo...' : 'Subir justificación'}</Button></>
      ) : <Badge variant="destructive">Sin justificación</Badge>}
    </li>
  );
}
