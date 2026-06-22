import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useEditarAcuerdo } from '../hooks/use-acuerdos';
import { useUsuarios } from '../../usuarios/hooks/use-usuarios';
import { Acuerdo } from '../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

const selectClass =
  'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm shadow-sm transition-all hover:border-accent/60 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

export function EditarAcuerdoModal({ acuerdo, actaId, onClose }: { acuerdo: Acuerdo; actaId: string; onClose: () => void }) {
  const { data: usuarios } = useUsuarios();
  const editar = useEditarAcuerdo(actaId);

  const [descripcion, setDescripcion] = useState(acuerdo.descripcion);
  const [responsableId, setResponsableId] = useState(acuerdo.responsableId);
  const [fechaFin, setFechaFin] = useState(acuerdo.fechaFin.substring(0, 10));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await editar.mutateAsync({
      id: acuerdo.id,
      descripcion,
      responsableId,
      fechaFin: new Date(fechaFin).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Editar acuerdo</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="descripcion-edit">Descripción</Label>
            <Textarea id="descripcion-edit" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="responsable-edit">Responsable</Label>
            <select id="responsable-edit" className={selectClass} value={responsableId} onChange={(e) => setResponsableId(e.target.value)} required>
              <option value="">Selecciona un responsable</option>
              {usuarios?.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaFin-edit">Fecha máxima de cumplimiento</Label>
            <Input id="fechaFin-edit" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
          </div>
          {editar.isError && <p className="text-sm font-medium text-destructive">No se pudo guardar. Intenta de nuevo.</p>}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={editar.isPending}>
              {editar.isPending && <Loader2 className="size-4 animate-spin" />}
              {editar.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
