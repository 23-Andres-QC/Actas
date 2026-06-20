import { Router } from 'express';
import { AsistenciaController } from './asistencia.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

/** Montadas bajo /api/actas/:actaId/asistencia */
export function asistenciaRoutes(controller: AsistenciaController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));
  router.post('/', asyncHandler(controller.registrar));
  // TODO: GET /inasistentes — requiere modelar lista de convocados por acta (fuera del alcance del esqueleto)
  return router;
}
