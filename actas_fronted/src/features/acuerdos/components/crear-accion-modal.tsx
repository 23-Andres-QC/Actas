import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useCrearAccion } from '../hooks/use-acuerdos';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

export function CrearAccionModal({ acuerdoId, onClose }: { acuerdoId: string; onClose: () => void }) {
  const crearAccion = useCrearAccion(acuerdoId);

  const [descripcion, setDescripcion] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await crearAccion.mutateAsync({ descripcion, fechaFin: new Date(fechaFin).toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Nueva acción</h3>
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
            <Label htmlFor="descripcion-accion">Descripción</Label>
            <Textarea
              id="descripcion-accion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la acción a realizar..."
              required
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaFinAccion">Fecha límite</Label>
            <Input
              id="fechaFinAccion"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
          {crearAccion.isError && (
            <p className="text-sm font-medium text-destructive">No se pudo crear la acción. Intenta de nuevo.</p>
          )}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="hero" disabled={crearAccion.isPending}>
              {crearAccion.isPending && <Loader2 className="size-4 animate-spin" />}
              {crearAccion.isPending ? 'Guardando...' : 'Guardar acción'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
