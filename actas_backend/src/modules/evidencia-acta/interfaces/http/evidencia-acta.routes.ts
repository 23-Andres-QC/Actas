import { Router } from 'express';
import multer from 'multer';
import { EvidenciaActaController } from './evidencia-acta.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/** Montadas bajo /api/v1/actas/:id/evidencias */
export function evidenciaActaRoutes(controller: EvidenciaActaController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));
  router.post('/', requireRole('superadmin', 'admin', 'convocador'), upload.single('archivo'), asyncHandler(controller.subir));
  router.get('/', asyncHandler(controller.listar));
  return router;
}
