import { Router } from 'express';
import { UsuarioController } from './usuario.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

export function usuarioRoutes(controller: UsuarioController): Router {
  const router = Router();

  router.use(asyncHandler(authMiddleware));

  router.get('/', requireRole('superadmin', 'admin'), asyncHandler(controller.listar));
  router.patch('/:id/rol', requireRole('superadmin', 'admin'), asyncHandler(controller.asignarRolHandler));

  return router;
}
