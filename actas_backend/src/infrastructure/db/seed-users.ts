import 'dotenv/config';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { pool } from './pool';
import { PostgresUsuarioRepository } from '../../modules/usuario/infrastructure/postgres-usuario.repository';
import { Usuario } from '../../modules/usuario/domain/usuario.entity';
import { Rol } from '../../modules/usuario/domain/value-objects/rol.vo';
import { logger } from '../../shared/logger/logger';

const initialUsers = [
  {
    nombre: 'Administrador General',
    email: process.env.SEED_SUPERADMIN_EMAIL,
    password: process.env.SEED_SUPERADMIN_PASSWORD,
    rol: 'superadmin',
    cargo: 'Administrador general',
  },
  {
    nombre: 'Administrador de Área',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    rol: 'admin',
    cargo: 'Administrador de área',
  },
  {
    nombre: 'Convocador',
    email: process.env.SEED_CONVOCADOR_EMAIL,
    password: process.env.SEED_CONVOCADOR_PASSWORD,
    rol: 'convocador',
    cargo: 'Convocador',
  },
  {
    nombre: 'Asistente',
    email: process.env.SEED_ASISTENTE_EMAIL,
    password: process.env.SEED_ASISTENTE_PASSWORD,
    rol: 'asistente',
    cargo: 'Asistente',
  },
] as const;

async function seedUsers(): Promise<void> {
  const repository = new PostgresUsuarioRepository(pool);
  let creados = 0;

  for (const initialUser of initialUsers) {
    if (!initialUser.email || !initialUser.password) {
      throw new Error(`Faltan credenciales iniciales para el rol ${initialUser.rol}`);
    }
    if (await repository.findByEmail(initialUser.email)) continue;

    await repository.save(
      Usuario.create(
        {
          nombre: initialUser.nombre,
          email: initialUser.email.toLowerCase(),
          passwordHash: await hash(initialUser.password, 12),
          rol: Rol.create(initialUser.rol),
          areaId: null,
          esJefe: false,
          cargo: initialUser.cargo,
        },
        randomUUID(),
      ),
    );
    creados += 1;
  }

  logger.info({ creados, total: initialUsers.length }, 'Usuarios iniciales verificados');
  await pool.end();
}

seedUsers().catch((error) => {
  logger.error({ err: error }, 'Error creando usuarios iniciales');
  process.exit(1);
});
