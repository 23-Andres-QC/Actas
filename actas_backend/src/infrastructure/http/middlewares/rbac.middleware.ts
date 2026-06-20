import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../shared/errors/domain-error';
import { Rol } from './auth.middleware';

/**
 * Restringe un endpoint a una lista de roles. Debe usarse siempre después
 * de authMiddleware. Es la primera línea de defensa de RBAC; la segunda
 * es Row Level Security en Postgres (ver docs/infraestructura.md).
 */
export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.rol)) {
      throw new ForbiddenError(`Esta acción requiere uno de los roles: ${roles.join(', ')}`);
    }
    next();
  };
}
