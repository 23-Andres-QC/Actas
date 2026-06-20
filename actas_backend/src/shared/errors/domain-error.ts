export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';

  constructor(entity: string, id: string) {
    super(`${entity} con id "${id}" no fue encontrado`);
  }
}

export class ValidationError extends DomainError {
  public readonly statusCode = 422;
  public readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  public readonly statusCode = 403;
  public readonly code = 'FORBIDDEN';

  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  public readonly statusCode = 401;
  public readonly code = 'UNAUTHORIZED';

  constructor(message = 'Sesión inválida o expirada') {
    super(message);
  }
}

export class ConflictError extends DomainError {
  public readonly statusCode = 409;
  public readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}
