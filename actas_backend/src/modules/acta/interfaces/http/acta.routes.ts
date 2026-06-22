import { Router } from 'express';
import multer from 'multer';
import { ActaController } from './acta.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

const uploadActaFisica = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

export function actaRoutes(controller: ActaController): Router {
  const router = Router();

  router.use(asyncHandler(authMiddleware));

  router.post('/', requireRole('superadmin', 'convocador'), asyncHandler(controller.crear));
  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.detalle));
  router.get('/:id/avance', asyncHandler(controller.avance));
  router.get('/:id/word', asyncHandler(controller.exportarWord));
  router.post(
    '/:id/acta-fisica',
    requireRole('superadmin', 'admin', 'convocador'),
    uploadActaFisica.single('archivo'),
    asyncHandler(controller.subirActaFisicaHandler),
  );

  return router;
}
