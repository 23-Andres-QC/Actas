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
