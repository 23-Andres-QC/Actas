import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './pool';
import { logger } from '../../shared/logger/logger';

async function migrate(): Promise<void> {
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    logger.info(`Ejecutando migración ${file}`);
    await pool.query(sql);
  }

  logger.info('Migraciones completadas');
  await pool.end();
}

migrate().catch((error) => {
  logger.error({ err: error }, 'Error ejecutando migraciones');
  process.exit(1);
});
