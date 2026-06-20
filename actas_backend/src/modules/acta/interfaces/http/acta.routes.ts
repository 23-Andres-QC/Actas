import { Router } from 'express';
import { ActaController } from './acta.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

export function actaRoutes(controller: ActaController): Router {
  const router = Router();

  router.use(asyncHandler(authMiddleware));

  router.post('/', requireRole('convocador'), asyncHandler(controller.crear));
  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.detalle));
  router.get('/:id/avance', asyncHandler(controller.avance));

  return router;
}
