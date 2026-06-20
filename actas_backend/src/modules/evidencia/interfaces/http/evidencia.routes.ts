import { Router } from 'express';
import multer from 'multer';
import { EvidenciaController } from './evidencia.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/** Montadas bajo /api/acuerdos/:id/evidencias */
export function evidenciaRoutes(controller: EvidenciaController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));
  router.post('/', upload.single('archivo'), asyncHandler(controller.subir));
  router.get('/', asyncHandler(controller.listar));
  return router;
}
