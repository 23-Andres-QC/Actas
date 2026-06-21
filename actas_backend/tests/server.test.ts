import { AddressInfo } from 'node:net';
import { Server } from 'node:http';
import { Pool } from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/infrastructure/supabase/client', () => ({
  supabaseAdmin: { storage: { from: vi.fn() } },
  EVIDENCIAS_BUCKET: 'evidencias',
  ACTAS_BUCKET: 'actas',
  FIRMAS_BUCKET: 'firmas',
}));

import { createServer } from '../src/infrastructure/http/server';

const servidores: Server[] = [];

async function iniciar(pool: Pool): Promise<string> {
  const server = createServer(pool).listen(0, '127.0.0.1');
  servidores.push(server);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  await Promise.all(
    servidores.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))),
  );
});

describe('estado del servidor', () => {
  it('responde health sin consultar Postgres', async () => {
    const query = vi.fn();
    const url = await iniciar({ query } as unknown as Pool);

    const response = await fetch(`${url}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(query).not.toHaveBeenCalled();
  });

  it('responde ready cuando Postgres está disponible', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] });
    const url = await iniciar({ query } as unknown as Pool);

    const response = await fetch(`${url}/ready`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ready' });
  });

  it('responde 503 y continúa vivo cuando Postgres falla', async () => {
    const query = vi.fn().mockRejectedValue(new Error('connection refused'));
    const url = await iniciar({ query } as unknown as Pool);

    const ready = await fetch(`${url}/ready`);
    const health = await fetch(`${url}/health`);

    expect(ready.status).toBe(503);
    expect(await ready.json()).toEqual({ status: 'not_ready' });
    expect(health.status).toBe(200);
  });

  it('protege las rutas de la API', async () => {
    const url = await iniciar({ query: vi.fn() } as unknown as Pool);

    const response = await fetch(`${url}/api/v1/actas`);

    expect(response.status).toBe(401);
  });
});
