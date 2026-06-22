import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { RostroController } from './rostro.controller';
import { authMiddleware } from '../infrastructure/auth.middleware';
import { TfjsFaceEmbedder } from '../infrastructure/tfjs-face-embedder';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export function rostroRoutes(controller: RostroController, embedder: TfjsFaceEmbedder): Router {
  const router = Router();
  router.use(authMiddleware);

  const requiereModeloListo = (_req: Request, res: Response, next: NextFunction): void => {
    if (!embedder.estaListo()) {
      res.status(503).json({
        error: { code: 'MODEL_NOT_READY', message: 'El modelo de reconocimiento facial aún no está disponible en el servidor' },
      });
      return;
    }
    next();
  };

  router.post('/enrolar', requiereModeloListo, upload.single('rostro'), (req, res, next) => controller.enrolar(req, res).catch(next));
  router.post('/verificar', requiereModeloListo, upload.single('rostro'), (req, res, next) => controller.verificar(req, res).catch(next));
  router.get('/estado', (req, res, next) => controller.estado(req, res).catch(next));

  return router;
}
