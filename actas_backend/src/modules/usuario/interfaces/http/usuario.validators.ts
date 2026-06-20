import { z } from 'zod';

export const asignarRolSchema = z.object({
  rol: z.enum(['superadmin', 'admin', 'convocador', 'asistente']),
});

export const listarUsuariosQuerySchema = z.object({
  areaId: z.string().uuid().optional(),
});
