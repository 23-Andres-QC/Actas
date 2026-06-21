import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../../shared/errors/domain-error';
import { logger } from '../../../shared/logger/logger';

// Códigos SQLSTATE de Postgres: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_UNIQUE_VIOLATION = '23505';

interface PostgresError {
  code: string;
}

function esErrorPostgres(err: unknown): err is PostgresError {
  return typeof err === 'object' && err !== null && typeof (err as { code?: unknown }).code === 'string';
}

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

  // Sin esto, un ID inexistente (ej. areaId inválido al crear un acta) salía como
  // 500 genérico en vez de un error claro y accionable para el cliente.
  if (esErrorPostgres(err) && err.code === PG_FOREIGN_KEY_VIOLATION) {
    res.status(422).json({
      error: { code: 'REFERENCIA_INVALIDA', message: 'Uno de los identificadores referenciados no existe' },
    });
    return;
  }
  if (esErrorPostgres(err) && err.code === PG_UNIQUE_VIOLATION) {
    res.status(409).json({ error: { code: 'CONFLICTO', message: 'El registro ya existe' } });
    return;
  }

  logger.error({ err }, 'Error inesperado');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
}
