import { z } from 'zod';

export const crearAccionSchema = z.object({
  descripcion: z.string().min(3),
  fechaFin: z.string().datetime(),
});

export const actualizarCompletadaSchema = z.object({
  completada: z.boolean(),
});

export const editarAccionSchema = z.object({
  descripcion: z.string().min(3).optional(),
  fechaFin: z.string().datetime().optional(),
});

export const reordenarAccionesSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0) })),
});
