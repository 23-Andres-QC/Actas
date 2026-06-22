import { Router } from 'express';
import { AccionController } from './accion.controller';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';

/** Rutas anidadas bajo /api/acuerdos/:acuerdoId/acciones */
export function accionNestedRoutes(controller: AccionController): Router {
  const router = Router({ mergeParams: true });
  router.use(asyncHandler(authMiddleware));
  router.post('/', asyncHandler(controller.crear));
  router.get('/', asyncHandler(controller.listarPorAcuerdoHandler));
  return router;
}

/** Rutas planas bajo /api/acciones */
export function accionRoutes(controller: AccionController): Router {
  const router = Router();
  router.use(asyncHandler(authMiddleware));
  router.patch('/reordenar', asyncHandler(controller.reordenarHandler));
  router.patch('/:id/completada', asyncHandler(controller.actualizarCompletadaHandler));
  router.patch('/:id', asyncHandler(controller.editarHandler));
  return router;
}
