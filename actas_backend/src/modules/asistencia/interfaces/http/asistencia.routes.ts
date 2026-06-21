import { Router } from 'express';
import multer from 'multer';
import { AsistenciaController } from './asistencia.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

const uploadFirma = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const uploadEvidencia = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/** Montadas bajo /api/actas/:actaId/asistencia */
export function asistenciaRoutes(controller: AsistenciaController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));

  router.post('/', uploadFirma.single('firma'), asyncHandler(controller.registrar));

  router.get(
    '/inasistentes',
    requireRole('superadmin', 'admin', 'convocador'),
    asyncHandler(controller.listarInasistentesHandler),
  );
  router.post(
    '/inasistentes/:usuarioId/evidencia',
    requireRole('superadmin', 'admin'),
    uploadEvidencia.single('archivo'),
    asyncHandler(controller.subirEvidenciaInasistenciaHandler),
  );

  return router;
}
