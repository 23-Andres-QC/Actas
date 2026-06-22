import { z } from 'zod';

export const registrarAsistenciaSchema = z.object({
  metodo: z.enum(['qr', 'firma_facial', 'biometrico']),
  qrToken: z.string().min(1).optional(),
});
