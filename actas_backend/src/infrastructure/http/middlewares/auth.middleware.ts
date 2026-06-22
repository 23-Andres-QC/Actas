import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../../shared/errors/domain-error';

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

interface TokenPayload {
  sub: string;
  email: string;
  rol: Rol;
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Falta el token de autenticación');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está configurado');

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), secret) as TokenPayload;
    req.user = { id: payload.sub, email: payload.email, rol: payload.rol };
    next();
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}
