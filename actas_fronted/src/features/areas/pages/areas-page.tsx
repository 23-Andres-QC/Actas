import { FormEvent, useState } from 'react';
import { Building2, Loader2, Plus } from 'lucide-react';
import { useAreas, useCrearArea } from '../hooks/use-areas';
import { PageHeader } from '../../../components/page-header';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export function AreasPage() {
  const { data: areas, isLoading, isError } = useAreas();
  const crearArea = useCrearArea();
  const [nombre, setNombre] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await crearArea.mutateAsync(nombre.trim());
    setNombre('');
  };

  return (
    <section>
      <PageHeader eyebrow="Administración" title="Áreas institucionales" description="Crea las áreas que se asignarán a usuarios, actas y responsables." />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Nueva área</h2>
          <p className="mt-1 text-sm text-muted-foreground">Usa un nombre único y reconocible.</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-2"><Label htmlFor="areaNombre">Nombre</Label><Input id="areaNombre" value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej. Gestión de Calidad" required /></div>
            {crearArea.isError && <p className="text-sm font-medium text-destructive">No se pudo crear el área.</p>}
            <Button type="submit" variant="hero" className="w-full" disabled={crearArea.isPending || !nombre.trim()}>
              {crearArea.isPending ? <Loader2 className="animate-spin" /> : <Plus />} Crear área
            </Button>
          </form>
        </Card>
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Áreas registradas</h2>
          {isLoading && <div className="h-40 animate-pulse rounded-2xl border bg-card" />}
          {isError && <Card className="p-6 text-sm text-destructive">No se pudieron cargar las áreas.</Card>}
          {!isLoading && !isError && !areas?.length && <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">Aún no hay áreas registradas.</Card>}
          <div className="grid gap-3 sm:grid-cols-2">
            {areas?.map((area) => (
              <Card key={area.id} className="flex items-center gap-3 p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-5" /></span>
                <div className="min-w-0"><p className="truncate font-medium">{area.nombre}</p><p className="truncate text-xs text-muted-foreground">{area.id}</p></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
