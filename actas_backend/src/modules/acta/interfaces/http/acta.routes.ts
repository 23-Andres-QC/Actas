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

  router.post('/', requireRole('superadmin', 'admin', 'convocador'), asyncHandler(controller.crear));
  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.detalle));
  router.get('/:id/avance', asyncHandler(controller.avance));
  router.get('/:id/word', asyncHandler(controller.exportarWord));
  router.get('/:id/documento-editable', asyncHandler(controller.obtenerDocumentoEditableHandler));
  router.post(
    '/:id/acta-fisica',
    requireRole('superadmin', 'admin', 'convocador'),
    uploadActaFisica.single('archivo'),
    asyncHandler(controller.subirActaFisicaHandler),
  );

  return router;
}

/**
 * Montadas SIN authMiddleware bajo /api/v1/onlyoffice: las llama el Document Server
 * de OnlyOffice (servidor a servidor), no el navegador del usuario, por lo que no
 * tiene nuestro JWT de sesion. Se valida en su lugar el JWT propio de OnlyOffice
 * (ver verificarTokenCallback) dentro del handler.
 */
export function onlyofficeCallbackRoutes(controller: ActaController): Router {
  const router = Router();
  router.post('/:actaId/callback', asyncHandler(controller.guardarDocumentoEditableCallbackHandler));
  return router;
}
