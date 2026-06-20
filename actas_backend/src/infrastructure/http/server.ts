import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { Pool } from 'pg';
import { buildContainer } from '../container';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { rateLimit } from './middlewares/rate-limit.middleware';
import { logger } from '../../shared/logger/logger';
import { usuarioRoutes } from '../../modules/usuario/interfaces/http/usuario.routes';
import { actaRoutes } from '../../modules/acta/interfaces/http/acta.routes';
import { acuerdoNestedRoutes, acuerdoRoutes } from '../../modules/acuerdo/interfaces/http/acuerdo.routes';
import { asistenciaRoutes } from '../../modules/asistencia/interfaces/http/asistencia.routes';
import { evidenciaRoutes } from '../../modules/evidencia/interfaces/http/evidencia.routes';

export function createServer(pool: Pool): Express {
  const app = express();
  const container = buildContainer(pool);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(rateLimit(100, 60_000));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (_req, res) => {
    await pool.query('select 1');
    res.json({ status: 'ready' });
  });

  app.use('/api/v1/usuarios', usuarioRoutes(container.usuarioController));
  app.use('/api/v1/actas', actaRoutes(container.actaController));
  app.use('/api/v1/actas/:actaId/acuerdos', acuerdoNestedRoutes(container.acuerdoController));
  app.use('/api/v1/acuerdos', acuerdoRoutes(container.acuerdoController));
  app.use('/api/v1/acuerdos/:id/evidencias', evidenciaRoutes(container.evidenciaController));
  app.use('/api/v1/actas/:actaId/asistencia', asistenciaRoutes(container.asistenciaController));

  app.use(errorHandlerMiddleware);

  return app;
}
