import { z } from 'zod';

export const asignarRolSchema = z.object({
  rol: z.enum(['superadmin', 'admin', 'convocador', 'asistente']),
});

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  rol: z.enum(['superadmin', 'admin', 'convocador', 'asistente']),
  areaId: z.string().uuid().nullable().optional(),
  cargo: z.string().trim().max(120).nullable().optional(),
});

export const listarUsuariosQuerySchema = z.object({
  areaId: z.string().uuid().optional(),
});
