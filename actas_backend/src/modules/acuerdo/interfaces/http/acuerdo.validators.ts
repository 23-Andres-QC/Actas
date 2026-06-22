import { z } from 'zod';

export const crearAcuerdoSchema = z.object({
  actaId: z.string().uuid(),
  responsableId: z.string().uuid(),
  descripcion: z.string().min(3),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
});

export const actualizarAvanceSchema = z.object({
  porcentajeAvance: z.number().min(0).max(100),
});

export const editarAcuerdoSchema = z.object({
  descripcion: z.string().min(3).optional(),
  responsableId: z.string().uuid().optional(),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional(),
});

export const reordenarSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), orden: z.number().int().min(0) })),
});
