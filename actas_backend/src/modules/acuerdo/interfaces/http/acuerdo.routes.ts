import { Router } from 'express';
import { AcuerdoController } from './acuerdo.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { requireRole } from '../../../../infrastructure/http/middlewares/rbac.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

/** Rutas anidadas bajo /api/actas/:actaId/acuerdos */
export function acuerdoNestedRoutes(controller: AcuerdoController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));
  router.post('/', requireRole('superadmin', 'convocador'), asyncHandler(controller.crear));
  router.get('/', asyncHandler(controller.listarPorActaHandler));
  return router;
}

/** Rutas planas bajo /api/acuerdos */
export function acuerdoRoutes(controller: AcuerdoController): Router {
  const router = Router();
  router.use(asyncHandler(authMiddleware));
  router.get('/mios', asyncHandler(controller.listarMios));
  router.patch('/:id/avance', requireRole('superadmin', 'convocador', 'admin', 'asistente'), asyncHandler(controller.actualizarAvanceHandler));
  return router;
}
