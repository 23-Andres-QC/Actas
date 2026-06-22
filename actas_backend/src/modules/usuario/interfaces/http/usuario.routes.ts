import { Router } from 'express';
import { UsuarioController } from './usuario.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

export function usuarioRoutes(controller: UsuarioController): Router {
  const router = Router();

  router.use(asyncHandler(authMiddleware));

  router.get('/', asyncHandler(controller.listar));
  router.post('/', requireRole('superadmin'), asyncHandler(controller.crear));
  router.patch('/:id/rol', requireRole('superadmin', 'admin'), asyncHandler(controller.asignarRolHandler));
  router.patch('/:id/area', requireRole('superadmin'), asyncHandler(controller.asignarAreaHandler));

  return router;
}
