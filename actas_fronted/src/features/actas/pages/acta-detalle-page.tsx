import { Link, useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ArrowLeft, BrainCircuit, CalendarDays, CheckSquare, Clock, Download, Eye, FileCheck2, FileText, Link2, Loader2, MapPin, PlusCircle, QrCode, Signature, Upload, UserX } from 'lucide-react';
import { useActa, useConsejos } from '../hooks/use-actas';
import { useAcuerdosPorActa } from '../../acuerdos/hooks/use-acuerdos';
import { CrearAcuerdoModal } from '../../acuerdos/components/crear-acuerdo-modal';
import { actasApi } from '../api/actas.api';
import { ConsejoAcuerdo } from '../types';
import { useAsistentesFirmados, useInasistentes, useSubirEvidenciaInasistencia } from '../../asistencia/hooks/use-inasistentes';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { SemaforoBadge, ProgressBar } from '../../../components/status';
import { useRol } from '../../../shared/auth/auth-context';
import { AsistenteFirmado, Inasistente } from '../../asistencia/types';
import { QrActaModal } from '../components/qr-acta-modal';

const TIPO_REUNION_LABEL: Record<string, string> = { interna: 'Interna', externa: 'Externa' };
const PROCESO_LABEL: Record<string, string> = { estrategico: 'Estratégico', operativo: 'Operativo', soporte: 'Soporte' };

export function ActaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: acta, isLoading, isError } = useActa(id ?? '');
  const { data: acuerdos } = useAcuerdosPorActa(id ?? '');
  const { esSuperAdmin, esAdmin, esConvocador } = useRol();
  const puedeVerInasistentes = esSuperAdmin || esAdmin || esConvocador;
  const [descargando, setDescargando] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);
  const [consejos, setConsejos] = useState<ConsejoAcuerdo[]>([]);
  const obtenerConsejos = useConsejos();
  const [mostrarFormAcuerdo, setMostrarFormAcuerdo] = useState(false);

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

  const fecha = new Date(acta.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/app" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Volver a actas
          </Link>
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold tracking-tight">Acta virtual</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Vista oficial para consulta y descarga.</p>
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
        <div className="flex items-start gap-2">
          <div className="rounded-2xl border bg-card p-2 shadow-card">
            <Button variant="hero" size="lg" onClick={descargarWord} disabled={descargando}>
              {descargando ? <Loader2 className="animate-spin" /> : <Download />}
              {descargando ? 'Preparando documento...' : 'Descargar Word'}
            </Button>
            <p className="px-2 pt-1.5 text-center text-[10px] text-muted-foreground">Documento editable .docx</p>
          </div>
          <Button variant="outline" size="lg" onClick={() => setMostrarQr(true)} title="Ver QR de asistencia">
            <QrCode />
          </Button>
          <Button variant="outline" size="lg" onClick={() => setMostrarFormAcuerdo(true)} className="gap-2">
            <PlusCircle /> Agregar acuerdo
          </Button>
        </div>
      </div>
      {mostrarQr && <QrActaModal acta={acta} onClose={() => setMostrarQr(false)} />}
      {mostrarFormAcuerdo && <CrearAcuerdoModal actaId={acta.id} onClose={() => setMostrarFormAcuerdo(false)} />}

      <div className="rounded-3xl border border-border/70 bg-slate-200/65 p-3 shadow-inner sm:p-6 lg:p-10">
        <article className="mx-auto min-h-[760px] max-w-4xl bg-white px-5 py-8 text-slate-800 shadow-xl sm:px-10 sm:py-12 lg:px-16">
          <header className="border-b-2 border-blue-900 pb-6">
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-blue-900 text-white"><FileText className="size-6" /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-900">Actas Institucionales</p><p className="text-xs text-slate-500">Gestión y seguimiento de compromisos</p></div>
              </div>
              <Badge variant={acta.porcentajeAvance >= 100 ? 'success' : 'secondary'}>{acta.porcentajeAvance >= 100 ? 'Completada' : 'En seguimiento'}</Badge>
            </div>
            <p className="mt-8 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Acta de reunión</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-2xl font-bold leading-tight text-blue-950 sm:text-3xl">{acta.titulo}</h2>
          </header>

          <div className="mt-7 grid overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-2">
            <DocumentField icon={CalendarDays} label="Fecha" value={fecha} />
            <DocumentField icon={Clock} label="Horario" value={`${acta.horaInicio} – ${acta.horaFin}`} />
            <DocumentField icon={MapPin} label="Lugar" value={acta.lugar} />
            <DocumentField icon={FileCheck2} label="Clasificación" value={`${TIPO_REUNION_LABEL[acta.tipoReunion]} · ${PROCESO_LABEL[acta.proceso]}`} />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold uppercase tracking-wider text-slate-500">Avance general</span><span className="font-bold text-blue-900">{acta.porcentajeAvance}%</span></div>
            <ProgressBar value={acta.porcentajeAvance} />
          </div>

          {acta.objetivo && <DocumentSection title="Objetivo de la reunión" content={acta.objetivo} />}
          {acta.agenda && <DocumentSection title="Agenda de la reunión" content={acta.agenda} />}

          <section className="mt-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-display text-lg font-bold text-blue-950">Acuerdos y compromisos</h3>
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
                  className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-60"
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
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">Sin acuerdos registrados.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                {acuerdos.map((acuerdo, index) => {
                  const consejo = consejos.find((c) => c.acuerdoId === acuerdo.id);
                  return (
                    <div key={acuerdo.id} className="border-b border-slate-200 p-4 last:border-0">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                        <div>
                          <p className="text-xs font-semibold text-slate-400">Compromiso {index + 1}</p>
                          <p className="mt-1 text-sm font-medium">{acuerdo.descripcion}</p>
                          <p className="mt-1 text-xs text-slate-500">Fecha límite: {new Date(acuerdo.fechaFin).toLocaleDateString('es-CO')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <SemaforoBadge estado={acuerdo.estadoSemaforo} />
                          <span className="text-sm font-bold text-blue-900">{acuerdo.porcentajeAvance}%</span>
                        </div>
                      </div>
                      {consejo && (
                        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                          <div className="flex items-start gap-2">
                            <BrainCircuit className="mt-0.5 size-4 shrink-0 text-blue-700" />
                            <div>
                              <p className="text-xs font-semibold text-blue-800">Consejo IA</p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{consejo.consejo}</p>
                              {consejo.acciones.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {consejo.acciones.map((accion: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                                      <CheckSquare className="mt-0.5 size-3 shrink-0 text-blue-500" />
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

          <FirmasSection actaId={acta.id} />

          <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-[10px] uppercase tracking-wider text-slate-400">Documento generado por Actas Institucionales</footer>
        </article>
      </div>

      {puedeVerInasistentes && <div className="mt-8"><InasistentesSection actaId={acta.id} puedeSubirEvidencia={esSuperAdmin || esAdmin} /></div>}
    </section>
  );
}

function DocumentField({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex gap-3 border-b border-slate-200 p-4 last:border-0 sm:border-r sm:[&:nth-child(even)]:border-r-0"><Icon className="mt-0.5 size-4 shrink-0 text-blue-800" /><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-0.5 text-sm font-medium">{value}</p></div></div>;
}

function DocumentSection({ title, content }: { title: string; content: string }) {
  return <section className="mt-8"><h3 className="border-b border-slate-200 pb-2 font-display text-lg font-bold text-blue-950">{title}</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{content}</p></section>;
}

function FirmasSection({ actaId }: { actaId: string }) {
  const { data: asistentes, isLoading } = useAsistentesFirmados(actaId);
  if (isLoading || !asistentes?.length) return null;
  return (
    <section className="mt-8">
      <h3 className="border-b border-slate-200 pb-2 font-display text-lg font-bold text-blue-950">Firmas de asistencia</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {asistentes.map((asistente) => <FirmaCard key={asistente.usuarioId} asistente={asistente} />)}
      </div>
    </section>
  );
}

function FirmaCard({ asistente }: { asistente: AsistenteFirmado }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200 p-3 text-center">
      <div className="grid h-20 w-full place-items-center overflow-hidden rounded-lg bg-slate-50">
        {asistente.firmaUrl ? (
          <img src={asistente.firmaUrl} alt={`Firma de ${asistente.nombre}`} className="h-16 w-auto max-w-[75%] object-contain" />
        ) : (
          <Signature className="size-6 text-slate-300" />
        )}
      </div>
      <p className="mt-2 border-t border-slate-300 pt-1 text-sm font-medium">{asistente.nombre}</p>
      {asistente.cargo && <p className="text-xs text-slate-500">{asistente.cargo}</p>}
    </div>
  );
}

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
