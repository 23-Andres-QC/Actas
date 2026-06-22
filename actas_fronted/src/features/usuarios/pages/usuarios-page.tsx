import { FormEvent, useState } from 'react';
import { Crown, Loader2, MapPin, Plus, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { useUsuarios, useAsignarRol, useCrearUsuario, useAsignarArea } from '../hooks/use-usuarios';
import { PageHeader } from '../../../components/page-header';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { CrearUsuarioInput, Usuario } from '../types';
import { useRol } from '../../../shared/auth/auth-context';
import { useAreas } from '../../areas/hooks/use-areas';

const ROLES: Usuario['rol'][] = ['superadmin', 'admin', 'convocador', 'asistente'];
const ROLE_LABEL: Record<Usuario['rol'], string> = {
  superadmin: 'SuperAdmin',
  admin: 'Administrador',
  convocador: 'Convocador',
  asistente: 'Asistente',
};

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError } = useUsuarios();
  const asignarRol = useAsignarRol();
  const { esSuperAdmin, esAdmin } = useRol();
  const puedeAsignar = esSuperAdmin || esAdmin;
  const [showCreate, setShowCreate] = useState(false);
  const [gestionandoAreaId, setGestionandoAreaId] = useState<string | null>(null);

  return (
    <section>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y roles"
        description="Gestiona los permisos de acceso de acuerdo con las responsabilidades institucionales."
        action={esSuperAdmin && <Button variant="hero" onClick={() => setShowCreate((value) => !value)}>{showCreate ? <X /> : <Plus />}{showCreate ? 'Cerrar formulario' : 'Crear usuario'}</Button>}
      />

      {showCreate && <CrearUsuarioForm onCreated={() => setShowCreate(false)} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Users className="size-5" /></span>
          <div><p className="font-display text-2xl font-bold">{usuarios?.length ?? 0}</p><p className="text-xs text-muted-foreground">Usuarios registrados</p></div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"><ShieldCheck className="size-5" /></span>
          <div><p className="font-display text-2xl font-bold">{usuarios?.filter((u) => u.rol === 'admin' || u.rol === 'superadmin').length ?? 0}</p><p className="text-xs text-muted-foreground">Administradores</p></div>
        </Card>
      </div>

      {isLoading && <div className="h-64 animate-pulse rounded-2xl border bg-card/70" />}
      {isError && <Card className="border-destructive/20 bg-destructive/5 p-6 text-center text-sm font-medium text-destructive">No pudimos cargar los usuarios.</Card>}
      {!isLoading && !isError && !usuarios?.length && (
        <Card className="border-dashed p-10 text-center">
          <UserRound className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No hay usuarios registrados.</p>
        </Card>
      )}

      {!!usuarios?.length && (
        <Card className="overflow-hidden border-border/70">
          <Table>
            <TableHeader className="bg-secondary/55">
              <TableRow>
                <TableHead className="px-5">Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol actual</TableHead>
                <TableHead>Área</TableHead>
                {puedeAsignar && <TableHead className="pr-5 text-right">Asignar rol</TableHead>}
                {esSuperAdmin && <TableHead className="pr-5 text-right">Gestionar área</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <>
                  <TableRow key={usuario.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">{usuario.nombre.slice(0, 2)}</span>
                        <span className="whitespace-nowrap font-medium">{usuario.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                    <TableCell><Badge variant="secondary">{ROLE_LABEL[usuario.rol]}</Badge></TableCell>
                    <TableCell>
                      <AreaBadge usuario={usuario} />
                    </TableCell>
                    {puedeAsignar && (
                      <TableCell className="pr-5 text-right">
                        <select
                          className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                          value={usuario.rol}
                          disabled={asignarRol.isPending}
                          aria-label={`Cambiar rol de ${usuario.nombre}`}
                          onChange={(e) => asignarRol.mutate({ usuarioId: usuario.id, rol: e.target.value as Usuario['rol'] })}
                        >
                          {ROLES.map((rol) => <option key={rol} value={rol}>{ROLE_LABEL[rol]}</option>)}
                        </select>
                      </TableCell>
                    )}
                    {esSuperAdmin && (
                      <TableCell className="pr-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGestionandoAreaId(gestionandoAreaId === usuario.id ? null : usuario.id)}
                        >
                          <MapPin className="size-3.5" />
                          {gestionandoAreaId === usuario.id ? 'Cerrar' : 'Área'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  {gestionandoAreaId === usuario.id && (
                    <TableRow key={`${usuario.id}-area`} className="bg-muted/30">
                      <TableCell colSpan={esSuperAdmin ? 6 : 5} className="px-5 py-4">
                        <GestionarAreaForm
                          usuario={usuario}
                          onDone={() => setGestionandoAreaId(null)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}

function AreaBadge({ usuario }: { usuario: Usuario }) {
  if (!usuario.areaId) return <span className="text-xs text-muted-foreground">Sin área</span>;
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="text-xs">{usuario.areaNombre ?? '…'}</Badge>
      {usuario.esJefe && (
        <span title="Jefe de área" className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <Crown className="size-3" /> Jefe
        </span>
      )}
    </div>
  );
}

function GestionarAreaForm({ usuario, onDone }: { usuario: Usuario; onDone: () => void }) {
  const { data: areas } = useAreas();
  const asignarArea = useAsignarArea();
  const [areaId, setAreaId] = useState<string>(usuario.areaId ?? '');
  const [esJefe, setEsJefe] = useState(usuario.esJefe);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await asignarArea.mutateAsync({ usuarioId: usuario.id, areaId: areaId || null, esJefe: areaId ? esJefe : false });
    onDone();
  };

  const selectClass = 'h-10 rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Área asignada</Label>
        <select
          className={selectClass}
          value={areaId}
          onChange={(e) => { setAreaId(e.target.value); if (!e.target.value) setEsJefe(false); }}
        >
          <option value="">Sin área</option>
          {areas?.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {areaId && (
        <div className="flex items-center gap-2 pb-1">
          <input
            id={`jefe-${usuario.id}`}
            type="checkbox"
            className="size-4 accent-amber-500"
            checked={esJefe}
            onChange={(e) => setEsJefe(e.target.checked)}
          />
          <Label htmlFor={`jefe-${usuario.id}`} className="flex items-center gap-1 text-sm">
            <Crown className="size-3.5 text-amber-500" /> Jefe de área
          </Label>
        </div>
      )}

      {asignarArea.isError && (
        <p className="text-xs font-medium text-destructive">
          Error al guardar. ¿Ya hay un jefe en ese área?
        </p>
      )}

      <Button type="submit" size="sm" variant="hero" disabled={asignarArea.isPending}>
        {asignarArea.isPending ? <Loader2 className="animate-spin" /> : null}
        Guardar
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancelar</Button>
    </form>
  );
}

function CrearUsuarioForm({ onCreated }: { onCreated: () => void }) {
  const crearUsuario = useCrearUsuario();
  const { data: areas } = useAreas();
  const [form, setForm] = useState<CrearUsuarioInput>({ nombre: '', email: '', password: '', rol: 'asistente', areaId: null, cargo: null });
  const update = <K extends keyof CrearUsuarioInput>(key: K, value: CrearUsuarioInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); await crearUsuario.mutateAsync(form); onCreated(); };
  const selectClass = 'flex h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

  return (
    <Card className="mb-6 border-primary/15 bg-card p-5 shadow-soft sm:p-6">
      <div className="mb-5"><h2 className="font-display text-lg font-semibold">Nuevo usuario</h2><p className="text-sm text-muted-foreground">La cuenta quedará disponible inmediatamente.</p></div>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="userNombre">Nombre completo</Label><Input id="userNombre" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="userEmail">Correo</Label><Input id="userEmail" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="userPassword">Contraseña inicial</Label><Input id="userPassword" type="password" minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="userRol">Rol</Label><select id="userRol" className={selectClass} value={form.rol} onChange={(e) => update('rol', e.target.value as Usuario['rol'])}>{ROLES.map((rol) => <option key={rol} value={rol}>{ROLE_LABEL[rol]}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="userArea">Área inicial</Label><select id="userArea" className={selectClass} value={form.areaId ?? ''} onChange={(e) => update('areaId', e.target.value || null)}><option value="">Sin área</option>{areas?.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="userCargo">Cargo institucional</Label><Input id="userCargo" value={form.cargo ?? ''} onChange={(e) => update('cargo', e.target.value || null)} /></div>
        {crearUsuario.isError && <p className="sm:col-span-2 text-sm font-medium text-destructive">No se pudo crear el usuario. Verifica que el correo no esté registrado.</p>}
        <div className="sm:col-span-2 flex justify-end"><Button type="submit" variant="hero" size="lg" disabled={crearUsuario.isPending}>{crearUsuario.isPending ? <Loader2 className="animate-spin" /> : <Plus />}{crearUsuario.isPending ? 'Creando...' : 'Crear usuario'}</Button></div>
      </form>
    </Card>
  );
}
