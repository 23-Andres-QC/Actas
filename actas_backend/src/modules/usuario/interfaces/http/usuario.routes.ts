import { Router } from 'express';
import multer from 'multer';
import { UsuarioController } from './usuario.controller';
import { FirmaUsuarioController } from './firma-usuario.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

const uploadFirma = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function usuarioRoutes(controller: UsuarioController, firmaController: FirmaUsuarioController): Router {
  const router = Router();

  router.use(asyncHandler(authMiddleware));

  router.get('/', asyncHandler(controller.listar));
  router.post('/', requireRole('superadmin'), asyncHandler(controller.crear));
  router.patch('/:id/rol', requireRole('superadmin', 'admin'), asyncHandler(controller.asignarRolHandler));
  router.patch('/:id/area', requireRole('superadmin'), asyncHandler(controller.asignarAreaHandler));

  router.get('/me/firma', asyncHandler(firmaController.obtenerHandler));
  router.post('/me/firma', uploadFirma.single('firma'), asyncHandler(firmaController.guardarHandler));

  return router;
}
