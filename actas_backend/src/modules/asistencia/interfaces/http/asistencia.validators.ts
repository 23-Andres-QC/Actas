import { z } from 'zod';

export const registrarAsistenciaSchema = z.object({
  metodo: z.enum(['qr', 'firma_facial']),
});
