import { Router } from 'express';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { AreaController } from './area.controller';

export function areaRoutes(controller: AreaController): Router {
  const router = Router();
  router.use(asyncHandler(authMiddleware));
  router.get('/', asyncHandler(controller.listar));
  router.post('/', requireRole('superadmin'), asyncHandler(controller.crear));
  return router;
}
