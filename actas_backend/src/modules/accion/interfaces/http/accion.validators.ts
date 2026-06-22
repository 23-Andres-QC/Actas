import { z } from 'zod';

export const crearAccionSchema = z.object({
  descripcion: z.string().min(3),
  fechaFin: z.string().datetime(),
});

export const actualizarCompletadaSchema = z.object({
  completada: z.boolean(),
});
