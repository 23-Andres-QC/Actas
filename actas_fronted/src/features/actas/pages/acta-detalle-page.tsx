import { useParams } from 'react-router-dom';
import { useRef } from 'react';
import { CalendarDays, Clock, MapPin, Upload, UserX, FileCheck2 } from 'lucide-react';
import { useActa } from '../hooks/use-actas';
import { useAcuerdosPorActa } from '../../acuerdos/hooks/use-acuerdos';
import { useInasistentes, useSubirEvidenciaInasistencia } from '../../asistencia/hooks/use-inasistentes';
import { PageHeader } from '../../../components/page-header';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { SemaforoBadge, ProgressBar } from '../../../components/status';
import { useRol } from '../../../shared/auth/auth-context';
import { Inasistente } from '../../asistencia/types';

const TIPO_REUNION_LABEL: Record<string, string> = { interna: 'Interna', externa: 'Externa' };
const PROCESO_LABEL: Record<string, string> = {
  estrategico: 'Estratégico',
  operativo: 'Operativo',
  soporte: 'Soporte',
};

export function ActaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: acta, isLoading, isError } = useActa(id ?? '');
  const { data: acuerdos } = useAcuerdosPorActa(id ?? '');
  const { esSuperAdmin, esAdmin, esConvocador } = useRol();
  const puedeVerInasistentes = esSuperAdmin || esAdmin || esConvocador;

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
  if (isError || !acta) return <p className="text-sm font-medium text-destructive">No se pudo cargar el acta</p>;

  return (
    <section>
      <PageHeader title={acta.titulo} description={`Avance general: ${acta.porcentajeAvance}%`} />

      <Card className="mb-6 space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{TIPO_REUNION_LABEL[acta.tipoReunion]}</Badge>
          <Badge variant="accent">{PROCESO_LABEL[acta.proceso]}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" /> {new Date(acta.fecha).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {acta.horaInicio} - {acta.horaFin}
          </span>
          {acta.lugar && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> {acta.lugar}
            </span>
          )}
        </div>

        <div className="max-w-sm">
          <ProgressBar value={acta.porcentajeAvance} />
        </div>

        {acta.objetivo && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Objetivo de la reunión</p>
            <p className="text-sm">{acta.objetivo}</p>
          </div>
        )}
        {acta.agenda && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Agenda de la reunión</p>
            <p className="whitespace-pre-line text-sm">{acta.agenda}</p>
          </div>
        )}
        {acta.desarrollo && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Desarrollo de la reunión</p>
            <p className="whitespace-pre-line text-sm">{acta.desarrollo}</p>
          </div>
        )}
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold">Acuerdos y compromisos</h2>

      {!acuerdos?.length ? (
        <p className="text-sm text-muted-foreground">Sin acuerdos registrados.</p>
      ) : (
        <Card className="mb-6">
          <Accordion type="single" collapsible>
            {acuerdos.map((acuerdo) => (
              <AccordionItem key={acuerdo.id} value={acuerdo.id} className="border-b px-5 last:border-0">
                <AccordionTrigger>
                  <div className="flex flex-1 flex-wrap items-center gap-4 pr-4">
                    <span className="min-w-[200px] flex-1 text-left">{acuerdo.descripcion}</span>
                    <SemaforoBadge estado={acuerdo.estadoSemaforo} />
                    <span className="text-xs text-muted-foreground">
                      fecha máxima {new Date(acuerdo.fechaFin).toLocaleDateString()}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Avance — Se cumplió: {acuerdo.porcentajeAvance >= 100 ? 'Sí' : 'No'}</span>
                      <span className="font-semibold">{acuerdo.porcentajeAvance}%</span>
                    </div>
                    <ProgressBar value={acuerdo.porcentajeAvance} />
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {puedeVerInasistentes && <InasistentesSection actaId={acta.id} puedeSubirEvidencia={esSuperAdmin || esAdmin} />}
    </section>
  );
}

function InasistentesSection({ actaId, puedeSubirEvidencia }: { actaId: string; puedeSubirEvidencia: boolean }) {
  const { data: inasistentes, isLoading, isError } = useInasistentes(actaId);

  return (
    <>
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <UserX className="size-5" /> Inasistentes
      </h2>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm font-medium text-destructive">No se pudieron cargar los inasistentes</p>}
      {!isLoading && !isError && !inasistentes?.length && (
        <p className="text-sm text-muted-foreground">Todos los miembros del área asistieron.</p>
      )}

      {!!inasistentes?.length && (
        <Card>
          <ul className="divide-y">
            {inasistentes.map((inasistente) => (
              <InasistenteRow
                key={inasistente.usuarioId}
                actaId={actaId}
                inasistente={inasistente}
                puedeSubirEvidencia={puedeSubirEvidencia}
              />
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function InasistenteRow({
  actaId,
  inasistente,
  puedeSubirEvidencia,
}: {
  actaId: string;
  inasistente: Inasistente;
  puedeSubirEvidencia: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subirEvidencia = useSubirEvidenciaInasistencia(actaId);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-medium">{inasistente.nombre}</p>
        <p className="text-xs text-muted-foreground">{inasistente.email}</p>
      </div>

      {inasistente.evidenciaUrl ? (
        <a
          href={inasistente.evidenciaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-success"
        >
          <FileCheck2 className="size-4" /> Justificación subida
        </a>
      ) : puedeSubirEvidencia ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirEvidencia.mutate({ usuarioId: inasistente.usuarioId, archivo });
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={subirEvidencia.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" /> {subirEvidencia.isPending ? 'Subiendo...' : 'Subir justificación'}
          </Button>
        </>
      ) : (
        <Badge variant="destructive">Sin justificación</Badge>
      )}
    </li>
  );
}
