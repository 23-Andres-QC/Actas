import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useEditarAccion } from '../hooks/use-acuerdos';
import { Accion } from '../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

export function EditarAccionModal({ accion, acuerdoId, onClose }: { accion: Accion; acuerdoId: string; onClose: () => void }) {
  const editar = useEditarAccion(acuerdoId);

  const [descripcion, setDescripcion] = useState(accion.descripcion);
  const [fechaFin, setFechaFin] = useState(accion.fechaFin.substring(0, 10));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await editar.mutateAsync({
      id: accion.id,
      descripcion,
      fechaFin: new Date(fechaFin).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Editar acción</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="descripcion-accion-edit">Descripción</Label>
            <Textarea id="descripcion-accion-edit" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaFin-accion-edit">Fecha límite</Label>
            <Input id="fechaFin-accion-edit" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
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
