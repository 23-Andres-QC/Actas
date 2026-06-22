import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { pool } from './infrastructure/pool';
import { FaceApiEmbedder } from './infrastructure/face-api-embedder';
import { PostgresRostroRepository } from './infrastructure/postgres-rostro.repository';
import { RostroController } from './routes/rostro.controller';
import { rostroRoutes } from './routes/rostro.routes';

const logger = pino();
const PORT = Number(process.env.PORT ?? 4100);

async function main(): Promise<void> {
  const embedder = new FaceApiEmbedder();
  try {
    await embedder.cargar();
    logger.info('Modelo de reconocimiento facial cargado');
  } catch (err) {
    logger.warn({ err }, 'No se pudo cargar el modelo de reconocimiento facial — /enrolar y /verificar responderán 503 hasta que esté disponible');
  }

  const rostroRepository = new PostgresRostroRepository(pool);
  const rostroController = new RostroController(embedder, rostroRepository);

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (_req, res) => {
    try {
      await pool.query('select 1');
      res.json({ status: 'ready', modeloListo: embedder.estaListo() });
    } catch (err) {
      logger.warn({ err }, 'Postgres no disponible');
      res.status(503).json({ status: 'not_ready' });
    }
  });

  app.use('/', rostroRoutes(rostroController, embedder));

  app.listen(PORT, () => logger.info(`actas_face_service escuchando en http://localhost:${PORT}`));
}

main().catch((err) => {
  logger.error({ err }, 'Error iniciando actas_face_service');
  process.exit(1);
});
