import { z } from 'zod';

const horaSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm)');

export const crearActaSchema = z.object({
  areaId: z.string().uuid(),
  titulo: z.string().min(3),
  fecha: z.string().datetime(),
  formato: z.enum(['estandar', 'ai']).default('estandar'),
  tipoReunion: z.enum(['interna', 'externa']),
  proceso: z.enum(['estrategico', 'operativo', 'soporte']),
  lugar: z.string().min(1),
  horaInicio: horaSchema,
  horaFin: horaSchema,
  objetivo: z.string().default(''),
  agenda: z.string().default(''),
  desarrollo: z.string().default(''),
});

export const listarActasQuerySchema = z.object({
  areaId: z.string().uuid().optional(),
});
