import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../../shared/errors/domain-error';
import { logger } from '../../../shared/logger/logger';

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: err.flatten(),
      },
    });
    return;
  }

  logger.error({ err }, 'Error inesperado');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
}
