import { FormEvent, useState } from 'react';
import { CheckCircle2, Circle, Loader2, PlusCircle } from 'lucide-react';
import { useCrearAcuerdo, useAcuerdosPorActa, useActualizarAvanceAcuerdo } from '../hooks/use-acuerdos';
import { useUsuarios } from '../../usuarios/hooks/use-usuarios';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';

const selectClass =
  'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

interface Props {
  actaId: string;
}

export function AcuerdosPanel({ actaId }: Props) {
  const { data: acuerdos, isLoading } = useAcuerdosPorActa(actaId);
  const { data: usuarios } = useUsuarios();
  const crearAcuerdo = useCrearAcuerdo(actaId);
  const actualizarAvance = useActualizarAvanceAcuerdo(actaId);

  const [abierto, setAbierto] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await crearAcuerdo.mutateAsync({
      descripcion,
      responsableId,
      fechaInicio: new Date().toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
    });
    setDescripcion('');
    setResponsableId('');
    setFechaFin('');
    setAbierto(false);
  };

  const toggleCumplido = (id: string, cumplido: boolean) => {
    actualizarAvance.mutate({ id, porcentajeAvance: cumplido ? 100 : 0 });
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Acuerdos y compromisos</h2>
          <p className="text-sm text-muted-foreground">{acuerdos?.length ?? 0} acuerdo{acuerdos?.length === 1 ? '' : 's'} registrado{acuerdos?.length === 1 ? '' : 's'}</p>
        </div>
        <Button variant="outline" onClick={() => setAbierto((v) => !v)} className="gap-2">
          <PlusCircle className="size-4" />
          Agregar acuerdo
        </Button>
      </div>

      {/* Formulario */}
      {abierto && (
        <Card className="mb-4 border-accent/30 p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Nuevo acuerdo</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el compromiso o acuerdo alcanzado..."
                required
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="responsable">Responsable</Label>
                <select
                  id="responsable"
                  className={selectClass}
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un responsable</option>
                  {usuarios?.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fechaFin">Fecha máxima de cumplimiento</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
            </div>
            {crearAcuerdo.isError && (
              <p className="text-sm font-medium text-destructive">No se pudo crear el acuerdo. Intenta de nuevo.</p>
            )}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => setAbierto(false)}>Cancelar</Button>
              <Button type="submit" variant="hero" disabled={crearAcuerdo.isPending}>
                {crearAcuerdo.isPending && <Loader2 className="size-4 animate-spin" />}
                {crearAcuerdo.isPending ? 'Guardando...' : 'Guardar acuerdo'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista */}
      {isLoading && <div className="h-24 animate-pulse rounded-xl border bg-card" />}

      {!isLoading && !acuerdos?.length && !abierto && (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Sin acuerdos registrados. Agrega el primero con el botón de arriba.
        </Card>
      )}

      {!!acuerdos?.length && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Fecha límite</th>
                  <th className="px-4 py-3 text-center">Cumplido</th>
                </tr>
              </thead>
              <tbody>
                {acuerdos.map((acuerdo) => {
                  const cumplido = acuerdo.porcentajeAvance >= 100;
                  const pendiente = actualizarAvance.isPending;
                  return (
                    <tr key={acuerdo.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="max-w-xs px-4 py-3">
                        <p className="line-clamp-2 leading-snug">{acuerdo.descripcion}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {acuerdo.responsableNombre ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(acuerdo.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleCumplido(acuerdo.id, !cumplido)}
                          disabled={pendiente}
                          title={cumplido ? 'Marcar como no cumplido' : 'Marcar como cumplido'}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          {cumplido ? (
                            <><CheckCircle2 className="size-5 text-success" /><Badge variant="success">Sí</Badge></>
                          ) : (
                            <><Circle className="size-5 text-muted-foreground" /><Badge variant="secondary">No</Badge></>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
