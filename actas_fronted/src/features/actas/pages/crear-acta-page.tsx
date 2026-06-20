import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCrearActa } from '../hooks/use-actas';
import { PageHeader } from '../../../components/page-header';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Proceso, TipoReunion } from '../types';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export function CrearActaPage() {
  const navigate = useNavigate();
  const crearActa = useCrearActa();

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
  const [desarrollo, setDesarrollo] = useState('');

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
      desarrollo,
    });
    navigate(`/app/actas/${acta.id}`);
  };

  return (
    <section className="mx-auto max-w-2xl">
      <PageHeader title="Crear acta" description="Registra una nueva acta institucional con el formato oficial." />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="areaId">Unidad orgánica (área UUID)</Label>
            <Input id="areaId" value={areaId} onChange={(e) => setAreaId(e.target.value)} required />
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
            <Label htmlFor="desarrollo">Desarrollo de la reunión</Label>
            <Textarea id="desarrollo" value={desarrollo} onChange={(e) => setDesarrollo(e.target.value)} rows={5} />
          </div>

          <p className="text-xs text-muted-foreground">
            Los acuerdos, responsables y asistentes se agregan desde el detalle del acta una vez creada.
          </p>

          <Button type="submit" variant="hero" className="w-full" disabled={crearActa.isPending}>
            {crearActa.isPending && <Loader2 className="size-4 animate-spin" />} Crear acta
          </Button>
          {crearActa.isError && <p className="text-sm font-medium text-destructive">No se pudo crear el acta</p>}
        </form>
      </Card>
    </section>
  );
}
