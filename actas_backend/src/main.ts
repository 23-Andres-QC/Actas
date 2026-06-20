import 'dotenv/config';
import { pool } from './infrastructure/db/pool';
import { createServer } from './infrastructure/http/server';
import { logger } from './shared/logger/logger';

const port = Number(process.env.PORT ?? 4000);
const app = createServer(pool);

app.listen(port, () => {
  logger.info(`Backend escuchando en http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
  logger.info('Cerrando servidor...');
  await pool.end();
  process.exit(0);
});
