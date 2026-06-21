import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../../shared/errors/domain-error';
import { supabaseAdmin } from '../../supabase/client';

export type Rol = 'superadmin' | 'admin' | 'convocador' | 'asistente';

export interface AuthenticatedUser {
  id: string;
  email: string;
  rol: Rol;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/**
 * Verifica el JWT emitido por Supabase Auth contra la API de Supabase
 * (auth.getUser), en vez de verificarlo localmente con un secreto compartido.
 * Esto funciona sin importar el algoritmo de firma del proyecto (HS256 legacy
 * o JWT Signing Keys asimétricos ECC/RSA) y evita mantener un secreto extra
 * en el backend. El rol nunca se confía desde el cliente: viene de
 * `app_metadata`, que solo se puede modificar con la service role key.
 *
 * Nota: el área del usuario NO viaja aquí. `app_metadata` solo se sincroniza
 * a mano al crear el usuario en Supabase y puede quedar desactualizada
 * respecto a `usuario.area_id` en Postgres; los casos de uso que necesiten
 * el área siempre la resuelven desde el `UsuarioRepository` (fuente de verdad).
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el token de autenticación');
  }

  const token = header.slice('Bearer '.length);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError('Token inválido o expirado');
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? '',
    rol: (data.user.app_metadata?.rol as Rol) ?? 'asistente',
  };
  next();
}
