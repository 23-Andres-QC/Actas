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
import { authRoutes } from '../../modules/usuario/interfaces/http/auth.routes';
import { actaRoutes, onlyofficeCallbackRoutes } from '../../modules/acta/interfaces/http/acta.routes';
import { acuerdoNestedRoutes, acuerdoRoutes } from '../../modules/acuerdo/interfaces/http/acuerdo.routes';
import { asistenciaRoutes } from '../../modules/asistencia/interfaces/http/asistencia.routes';
import { evidenciaRoutes } from '../../modules/evidencia/interfaces/http/evidencia.routes';
import { accionNestedRoutes, accionRoutes } from '../../modules/accion/interfaces/http/accion.routes';
import { evidenciaAccionRoutes } from '../../modules/evidencia-accion/interfaces/http/evidencia-accion.routes';
import { areaRoutes } from '../../modules/area/interfaces/http/area.routes';

export function createServer(pool: Pool): Express {
  const app = express();
  const container = buildContainer(pool);

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(rateLimit(100, 60_000));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (_req, res) => {
    try {
      await pool.query('select 1');
      res.json({ status: 'ready' });
    } catch (err) {
      logger.warn({ err }, 'Postgres no disponible');
      res.status(503).json({ status: 'not_ready' });
    }
  });

  app.use('/api/v1/auth', authRoutes(container.authController));
  app.use('/api/v1/areas', areaRoutes(container.areaController));
  app.use('/api/v1/usuarios', usuarioRoutes(container.usuarioController, container.firmaUsuarioController));
  app.use('/api/v1/actas', actaRoutes(container.actaController));
  app.use('/api/v1/onlyoffice', onlyofficeCallbackRoutes(container.actaController));
  app.use('/api/v1/actas/:actaId/acuerdos', acuerdoNestedRoutes(container.acuerdoController));
  app.use('/api/v1/acuerdos', acuerdoRoutes(container.acuerdoController));
  app.use('/api/v1/acuerdos/:id/evidencias', evidenciaRoutes(container.evidenciaController));
  app.use('/api/v1/acuerdos/:acuerdoId/acciones', accionNestedRoutes(container.accionController));
  app.use('/api/v1/acciones/:id/evidencias', evidenciaAccionRoutes(container.evidenciaAccionController));
  app.use('/api/v1/acciones', accionRoutes(container.accionController));
  app.use('/api/v1/actas/:actaId/asistencia', asistenciaRoutes(container.asistenciaController));

  app.use(errorHandlerMiddleware);

  return app;
}
