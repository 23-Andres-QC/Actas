import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useCrearAcuerdo } from '../hooks/use-acuerdos';
import { useUsuarios } from '../../usuarios/hooks/use-usuarios';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

const selectClass =
  'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

export function CrearAcuerdoModal({ actaId, onClose }: { actaId: string; onClose: () => void }) {
  const { data: usuarios } = useUsuarios();
  const crearAcuerdo = useCrearAcuerdo(actaId);

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Nuevo acuerdo</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
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
          {crearAcuerdo.isError && (
            <p className="text-sm font-medium text-destructive">No se pudo crear el acuerdo. Intenta de nuevo.</p>
          )}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={crearAcuerdo.isPending}>
              {crearAcuerdo.isPending && <Loader2 className="size-4 animate-spin" />}
              {crearAcuerdo.isPending ? 'Guardando...' : 'Guardar acuerdo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
