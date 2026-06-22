import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronDown, ChevronRight, Download, Eye, FileCheck2, Loader2, MapPin, PlusCircle, QrCode, Upload } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { ProgressBar } from '../../../components/status';
import { useRol } from '../../../shared/auth/auth-context';
import { useSubirActaFisica } from '../hooks/use-actas';
import { actasApi } from '../api/actas.api';
import { Acta } from '../types';
import { extraerTextoPdf } from '../utils/extraer-texto-pdf';
import { QrActaModal } from './qr-acta-modal';
import { useAcuerdosPorActa } from '../../acuerdos/hooks/use-acuerdos';
import { CrearAcuerdoModal } from '../../acuerdos/components/crear-acuerdo-modal';
import { AcuerdoRow } from '../../acuerdos/components/acuerdo-row';

const PROCESO_LABEL: Record<Acta['proceso'], string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};

export function ActaCard({ acta }: { acta: Acta }) {
  const completed = acta.porcentajeAvance >= 100;
  const { esSuperAdmin, esAdmin, esConvocador } = useRol();
  const puedeSubirActaFisica = esSuperAdmin || esAdmin || esConvocador;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subirActaFisica = useSubirActaFisica();
  const [mostrarQr, setMostrarQr] = useState(false);
  const [mostrarCrearAcuerdo, setMostrarCrearAcuerdo] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const { data: acuerdos, isLoading: cargandoAcuerdos, isError: errorAcuerdos } = useAcuerdosPorActa(expandida ? acta.id : '');

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

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all duration-200 hover:border-accent/50 hover:shadow-soft">
      <div
        className="flex cursor-pointer items-center gap-4 px-5 py-4"
        onClick={() => setExpandida((valor) => !valor)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpandida((valor) => !valor);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expandida}
        aria-controls={`acuerdos-${acta.id}`}
      >
      {/* Badges */}
      <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
        <Badge variant={completed ? 'success' : 'secondary'} className="justify-center">
          {completed ? 'Completada' : 'En seguimiento'}
        </Badge>
        <Badge variant="outline" className="justify-center">
          {PROCESO_LABEL[acta.proceso]}
        </Badge>
      </div>

      {/* Info principal */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">{acta.titulo}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3 shrink-0" />
            {new Date(acta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate max-w-[140px]">{acta.lugar}</span>
          </span>
        </div>
      </div>

      {/* Avance */}
      <div className="hidden w-36 shrink-0 md:block">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted-foreground">Avance</span>
          <span className="font-semibold text-foreground">{acta.porcentajeAvance}%</span>
        </div>
        <ProgressBar value={acta.porcentajeAvance} />
      </div>

      {/* Acción */}
      <Link
        to={`/app/actas/${acta.id}`}
        onClick={(event) => event.stopPropagation()}
        className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Eye className="size-3.5" />
        <span className="hidden sm:inline">Ver acta</span>
        <ChevronRight className="size-3.5 sm:hidden" />
      </Link>

      <button
        type="button"
        title="Ver QR de asistencia"
        onClick={(event) => {
          event.stopPropagation();
          setMostrarQr(true);
        }}
        className="flex shrink-0 items-center justify-center rounded-lg border border-input bg-background p-2 text-foreground transition-colors hover:bg-secondary"
      >
        <QrCode className="size-3.5" />
      </button>

      <button
        type="button"
        title="Descargar Word"
        disabled={descargando}
        onClick={(event) => {
          event.stopPropagation();
          descargarWord();
        }}
        className="flex shrink-0 items-center justify-center rounded-lg border border-input bg-background p-2 text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
      >
        {descargando ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
      </button>

      {/* Acta física */}
      {(acta.urlActaFisica || puedeSubirActaFisica) && (
        <div className="flex shrink-0 items-center gap-1.5">
          {acta.urlActaFisica && (
            <a
              href={acta.urlActaFisica}
              onClick={(event) => {
                event.stopPropagation();
                if (acta.urlActaFisica?.endsWith('.pdf') || acta.urlActaFisica?.includes('pdf')) {
                  extraerTextoPdf(acta.urlActaFisica).then((texto) => {
                    console.log(`%c📄 Texto del PDF — ${acta.titulo}`, 'font-weight:bold;color:#16a34a;font-size:13px');
                    console.log(texto);
                  }).catch((err) => {
                    console.error('Error extrayendo texto del PDF:', err);
                  });
                }
              }}
              target="_blank"
              rel="noreferrer"
              title="Ver acta física"
              className="flex items-center justify-center rounded-lg border border-success/30 bg-success/5 p-2 text-success transition-colors hover:bg-success/10"
            >
              <FileCheck2 className="size-3.5" />
            </a>
          )}
          {puedeSubirActaFisica && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
                onChange={(event) => {
                  const archivo = event.target.files?.[0];
                  if (archivo) subirActaFisica.mutate({ id: acta.id, archivo });
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                title={acta.urlActaFisica ? 'Actualizar acta física' : 'Subir acta física'}
                disabled={subirActaFisica.isPending}
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center rounded-lg border border-input bg-background p-2 text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
              >
                <Upload className="size-3.5" />
              </button>
            </>
          )}
        </div>
      )}
        <button
          type="button"
          title={expandida ? 'Ocultar acuerdos' : 'Mostrar acuerdos'}
          onClick={(event) => {
            event.stopPropagation();
            setExpandida((valor) => !valor);
          }}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronDown className={`size-4 transition-transform ${expandida ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expandida && (
        <div id={`acuerdos-${acta.id}`} className="border-t bg-muted/15 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Acuerdos y compromisos</p>
              <p className="text-xs text-muted-foreground">
                {acuerdos?.length ?? 0} acuerdo{acuerdos?.length === 1 ? '' : 's'} registrado{acuerdos?.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              title="Agregar acuerdo"
              onClick={(event) => {
                event.stopPropagation();
                setMostrarCrearAcuerdo(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <PlusCircle className="size-3.5" /> Agregar
            </button>
          </div>

          {cargandoAcuerdos && <div className="h-16 animate-pulse rounded-lg border bg-card" />}
          {errorAcuerdos && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">No se pudieron cargar los acuerdos.</p>}
          {!cargandoAcuerdos && !errorAcuerdos && !acuerdos?.length && (
            <p className="rounded-lg border border-dashed bg-card/70 p-4 text-center text-sm text-muted-foreground">Esta acta todavía no tiene acuerdos registrados.</p>
          )}
          {!!acuerdos?.length && (
            <div className="space-y-2">
              {acuerdos.map((acuerdo) => <AcuerdoRow key={acuerdo.id} acuerdo={acuerdo} />)}
            </div>
          )}
        </div>
      )}
      {mostrarQr && <QrActaModal acta={acta} onClose={() => setMostrarQr(false)} />}
      {mostrarCrearAcuerdo && <CrearAcuerdoModal actaId={acta.id} onClose={() => setMostrarCrearAcuerdo(false)} />}
    </div>
  );
}
