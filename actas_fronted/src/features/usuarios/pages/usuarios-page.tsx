import { useUsuarios, useAsignarRol } from '../hooks/use-usuarios';
import { PageHeader } from '../../../components/page-header';
import { Card } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Usuario } from '../types';
import { useRol } from '../../../shared/auth/auth-context';

const ROLES: Usuario['rol'][] = ['superadmin', 'admin', 'convocador', 'asistente'];

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError } = useUsuarios();
  const asignarRol = useAsignarRol();
  const { esSuperAdmin, esAdmin } = useRol();
  const puedeAsignar = esSuperAdmin || esAdmin;

  return (
    <section>
      <PageHeader title="Usuarios y roles" description="Administra los roles de los usuarios del sistema." />

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {isError && <p className="text-sm font-medium text-destructive">No se pudieron cargar los usuarios</p>}
      {!isLoading && !usuarios?.length && (
        <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
      )}

      {!!usuarios?.length && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                {puedeAsignar && <TableHead className="text-right">Acción</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell className="capitalize">{usuario.rol}</TableCell>
                  {puedeAsignar && (
                    <TableCell className="text-right">
                      <select
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={usuario.rol}
                        onChange={(e) =>
                          asignarRol.mutate({ usuarioId: usuario.id, rol: e.target.value as Usuario['rol'] })
                        }
                      >
                        {ROLES.map((rol) => (
                          <option key={rol} value={rol}>
                            {rol}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}
