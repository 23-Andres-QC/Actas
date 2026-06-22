import { Link, useParams } from 'react-router-dom';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, BrainCircuit, Check, CheckCircle2, CheckSquare, ClipboardList,
  Download, FileCheck2, Link2, Loader2, PenLine, PlusCircle, QrCode, RefreshCw, Save, Upload, UserX,
} from 'lucide-react';
import { useActa, useConsejos, useResumenActa, type ResumenActa } from '../hooks/use-actas';
import { useAcuerdosPorActa } from '../../acuerdos/hooks/use-acuerdos';
import { Acuerdo } from '../../acuerdos/types';
import { AcuerdoRow } from '../../acuerdos/components/acuerdo-row';
import { CrearAcuerdoModal } from '../../acuerdos/components/crear-acuerdo-modal';
import { actasApi } from '../api/actas.api';
import { ConsejoAcuerdo } from '../types';
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
  const { data: acuerdosServidor } = useAcuerdosPorActa(id ?? '');
  const [ordenLocalAcuerdos, setOrdenLocalAcuerdos] = useState<Acuerdo[] | null>(null);
  const acuerdos = ordenLocalAcuerdos ?? acuerdosServidor;
  const { esSuperAdmin, esAdmin, esConvocador } = useRol();
  const puedeVerInasistentes = esSuperAdmin || esAdmin || esConvocador;
  const [descargando, setDescargando] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);
  const [consejos, setConsejos] = useState<ConsejoAcuerdo[]>([]);
  const [resumen, setResumen] = useState<ResumenActa | null>(null);
  const obtenerConsejos = useConsejos();
  const generarResumen = useResumenActa();
  const [mostrarFormAcuerdo, setMostrarFormAcuerdo] = useState(false);
  const [actualizandoDocumento, setActualizandoDocumento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const editorActaRef = useRef<EditorActaHandle>(null);

  const moverAcuerdo = (index: number, direccion: 'arriba' | 'abajo') => {
    const lista = [...(acuerdos ?? [])] as Acuerdo[];
    const otro = direccion === 'arriba' ? index - 1 : index + 1;
    const tmp = lista[index]!;
    lista[index] = lista[otro]!;
    lista[otro] = tmp;
    setOrdenLocalAcuerdos(lista);
  };

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
            onClick={() => generarResumen.mutate({ acta, acuerdos: acuerdos ?? [] }, { onSuccess: setResumen })}
            disabled={generarResumen.isPending || !acuerdos?.length}
          >
            {generarResumen.isPending ? <Loader2 className="animate-spin" /> : <ClipboardList />}
            {generarResumen.isPending ? 'Generando...' : 'Resumen ejecutivo'}
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
      {resumen && (
        <div className="mb-5">
          <ResumenEjecutivoPanel resumen={resumen} onCerrar={() => setResumen(null)} />
        </div>
      )}

      <EditorActa ref={editorActaRef} actaId={acta.id} onActualizandoChange={setActualizandoDocumento} />

      <section className="mt-8 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <h3 className="font-display text-lg font-bold text-foreground">Acuerdos y compromisos</h3>
          {!!acuerdos?.length && (
            <button
              type="button"
              onClick={() =>
                obtenerConsejos.mutate(
                  { acta, acuerdos: acuerdos ?? [] },
                  { onSuccess: (data) => setConsejos(data.consejos) },
                )
              }
              disabled={obtenerConsejos.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
            >
              {obtenerConsejos.isPending ? (
                <><Loader2 className="size-3.5 animate-spin" /> Analizando con IA...</>
              ) : (
                <><BrainCircuit className="size-3.5" /> Analizar con IA</>
              )}
            </button>
          )}
        </div>

        {!acuerdos?.length ? (
          <p className="mt-4 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Sin acuerdos registrados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {acuerdos.map((acuerdo, index) => {
              const consejo = consejos.find((c) => c.acuerdoId === acuerdo.id);
              return (
                <div key={acuerdo.id}>
                  <AcuerdoRow
                    acuerdo={acuerdo}
                    actaId={acta.id}
                    isFirst={index === 0}
                    isLast={index === acuerdos.length - 1}
                    onMoverArriba={() => moverAcuerdo(index, 'arriba')}
                    onMoverAbajo={() => moverAcuerdo(index, 'abajo')}
                  />
                  {consejo && (
                    <div className="mt-1.5 rounded-lg border border-primary/10 bg-primary/5 p-3">
                      <div className="flex items-start gap-2">
                        <BrainCircuit className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-xs font-semibold text-primary">Consejo IA</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{consejo.consejo}</p>
                          {consejo.acciones.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {consejo.acciones.map((accion: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                  <CheckSquare className="mt-0.5 size-3 shrink-0 text-primary" />
                                  {accion}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

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

const ESTADO_GENERAL_STYLE: Record<ResumenActa['estadoGeneral'], string> = {
  bueno: 'border-green-200 bg-green-50 text-green-800',
  en_riesgo: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  critico: 'border-red-200 bg-red-50 text-red-800',
};
const ESTADO_GENERAL_LABEL: Record<ResumenActa['estadoGeneral'], string> = {
  bueno: 'Buen estado',
  en_riesgo: 'En riesgo',
  critico: 'Crítico',
};

function ResumenEjecutivoPanel({ resumen, onCerrar }: { resumen: ResumenActa; onCerrar: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 shrink-0 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Resumen ejecutivo IA</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${ESTADO_GENERAL_STYLE[resumen.estadoGeneral]}`}>
            {ESTADO_GENERAL_LABEL[resumen.estadoGeneral]}
          </span>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <span className="text-xs">✕</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {/* Resumen de la reunión */}
        <div className="sm:col-span-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sobre esta reunión</p>
          <p className="text-sm leading-relaxed text-slate-700">{resumen.resumenReunion}</p>
        </div>

        {/* Lo que se ha hecho */}
        {resumen.loQueSeHaHecho.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <CheckCircle2 className="size-3 text-success" /> Lo que se ha hecho
            </p>
            <ul className="space-y-1.5">
              {resumen.loQueSeHaHecho.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lo que falta por hacer */}
        {resumen.loQueFaltaPorHacer.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <AlertTriangle className="size-3 text-warning" /> Lo que falta por hacer
            </p>
            <ul className="space-y-1.5">
              {resumen.loQueFaltaPorHacer.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-warning" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Acuerdos en riesgo */}
        {resumen.acuerdosEnRiesgo.length > 0 && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Compromisos en riesgo</p>
            <ul className="space-y-1.5">
              {resumen.acuerdosEnRiesgo.map((a) => (
                <li key={a.id} className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-xs text-slate-700">
                  <span className="font-medium">{a.descripcion}</span>
                  <span className="ml-2 text-slate-500">— {a.razon}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
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
