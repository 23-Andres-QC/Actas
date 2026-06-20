import { NextFunction, Request, Response } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Express 4 no propaga rechazos de promesas al error-handler automáticamente;
 * este wrapper evita repetir try/catch en cada controlador.
 */
export function asyncHandler(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
