import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useCrearActa } from '../hooks/use-actas';
import { PageHeader } from '../../../components/page-header';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Proceso, TipoReunion } from '../types';
import { useAreas } from '../../areas/hooks/use-areas';
import { useUsuarios } from '../../usuarios/hooks/use-usuarios';
import { GeminiChat } from '../components/gemini-chat';
import type { ActaAutocompletado } from '../components/gemini-chat';

const selectClass =
  'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

export function CrearActaPage() {
  const navigate = useNavigate();
  const crearActa = useCrearActa();
  const { data: areas } = useAreas();

  const [titulo, setTitulo] = useState('');
  const [areaId, setAreaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [tipoReunion, setTipoReunion] = useState<TipoReunion>('interna');
  const [proceso, setProceso] = useState<Proceso>('estrategico');
  const [lugar, setLugar] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [agenda, setAgenda] = useState('');
  const [urlReunion, setUrlReunion] = useState('');
  const [invitarTodos, setInvitarTodos] = useState(true);
  const [invitadosIds, setInvitadosIds] = useState<string[]>([]);
  const [chatAbierto, setChatAbierto] = useState(false);

  const { data: usuariosArea } = useUsuarios(areaId || undefined);

  const toggleInvitado = (usuarioId: string) => {
    setInvitadosIds((prev) => (prev.includes(usuarioId) ? prev.filter((id) => id !== usuarioId) : [...prev, usuarioId]));
  };

  const handleAutocompletar = (datos: ActaAutocompletado) => {
    if (datos.titulo) setTitulo(datos.titulo);
    if (datos.tipoReunion) setTipoReunion(datos.tipoReunion);
    if (datos.proceso) setProceso(datos.proceso);
    if (datos.areaId) setAreaId(datos.areaId);
    if (datos.lugar) setLugar(datos.lugar);
    if (datos.fecha) setFecha(datos.fecha);
    if (datos.horaInicio) setHoraInicio(datos.horaInicio);
    if (datos.horaFin) setHoraFin(datos.horaFin);
    if (datos.objetivo) setObjetivo(datos.objetivo);
    if (datos.agenda) setAgenda(datos.agenda);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const acta = await crearActa.mutateAsync({
      titulo,
      areaId,
      fecha: new Date(fecha).toISOString(),
      formato: 'estandar',
      tipoReunion,
      proceso,
      lugar,
      horaInicio,
      horaFin,
      objetivo,
      agenda,
      urlReunion: urlReunion || undefined,
      invitadosIds: invitarTodos ? undefined : invitadosIds,
    });
    navigate(`/app/actas/${acta.id}`);
  };

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Nuevo registro"
        title="Crear acta"
        description="Completa la información oficial de la reunión. Después podrás agregar acuerdos, responsables y asistentes."
        action={
          <Button type="button" variant="outline" onClick={() => setChatAbierto(true)} className="gap-2">
            <Sparkles className="size-4" />
            Completar con IA
          </Button>
        }
      />

      <Card className="border-border/70 p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipoReunion">Tipo de reunión</Label>
              <select
                id="tipoReunion"
                className={selectClass}
                value={tipoReunion}
                onChange={(e) => setTipoReunion(e.target.value as TipoReunion)}
              >
                <option value="interna">Interna</option>
                <option value="externa">Externa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proceso">Proceso</Label>
              <select
                id="proceso"
                className={selectClass}
                value={proceso}
                onChange={(e) => setProceso(e.target.value as Proceso)}
              >
                <option value="estrategico">Estratégico</option>
                <option value="operativo">Operativo</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="areaId">Área responsable</Label>
            <select id="areaId" className={selectClass} value={areaId} onChange={(e) => setAreaId(e.target.value)} required>
              <option value="">Selecciona un área</option>
              {areas?.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Asunto de la reunión</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lugar">Lugar físico o virtual</Label>
            <Input id="lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horaInicio">Hora de inicio</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horaFin">Hora final</Label>
              <Input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="objetivo">Objetivo de la reunión</Label>
            <Textarea id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agenda">Agenda de la reunión</Label>
            <Textarea id="agenda" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urlReunion">URL de la reunión (Zoom, Meet, Teams...)</Label>
            <Input
              id="urlReunion"
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={urlReunion}
              onChange={(e) => setUrlReunion(e.target.value)}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 p-4">
            <Label>Invitados</Label>
            <div className="flex items-center gap-2">
              <input
                id="invitarTodos"
                type="checkbox"
                className="size-4 accent-primary"
                checked={invitarTodos}
                onChange={(e) => setInvitarTodos(e.target.checked)}
              />
              <Label htmlFor="invitarTodos" className="text-sm font-normal">Invitar a todos los del área</Label>
            </div>
            {!invitarTodos && (
              <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-border/50 p-2">
                {!areaId && <p className="text-xs text-muted-foreground">Selecciona un área primero.</p>}
                {areaId && !usuariosArea?.length && <p className="text-xs text-muted-foreground">No hay usuarios en esta área.</p>}
                {usuariosArea?.map((usuario) => (
                  <div key={usuario.id} className="flex items-center gap-2">
                    <input
                      id={`invitado-${usuario.id}`}
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={invitadosIds.includes(usuario.id)}
                      onChange={() => toggleInvitado(usuario.id)}
                    />
                    <Label htmlFor={`invitado-${usuario.id}`} className="text-sm font-normal">
                      {usuario.nombre} <span className="text-muted-foreground">({usuario.email})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="rounded-xl bg-secondary/55 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Los acuerdos y responsables se agregan desde el detalle del acta una vez creada.
          </p>

          {crearActa.isError && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">No se pudo crear el acta. Revisa los datos e intenta nuevamente.</p>}
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate('/app')}>Cancelar</Button>
            <Button type="submit" variant="hero" size="lg" disabled={crearActa.isPending}>
              {crearActa.isPending && <Loader2 className="size-4 animate-spin" />} {crearActa.isPending ? 'Creando acta...' : 'Crear acta'}
            </Button>
          </div>
        </form>
      </Card>

      {chatAbierto && (
        <GeminiChat
          areas={areas ?? []}
          onAutocompletar={handleAutocompletar}
          onCerrar={() => setChatAbierto(false)}
        />
      )}
    </section>
  );
}
