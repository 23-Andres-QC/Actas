import { Router } from 'express';
import { asyncHandler } from '../../../../infrastructure/http/middlewares/async-handler';
import { AuthController } from './auth.controller';

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/login', asyncHandler(controller.login));
  return router;
}
