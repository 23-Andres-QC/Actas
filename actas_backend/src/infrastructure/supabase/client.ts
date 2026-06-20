import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Cliente con privilegios de servicio. Solo se usa en el backend
 * (nunca se expone al frontend ni mobile) para operaciones de Storage
 * y administración de usuarios que requieren bypass de RLS.
 *
 * El backend no usa canales realtime, pero el SDK siempre instancia un
 * RealtimeClient internamente; en Node < 22 (sin WebSocket nativo) eso
 * revienta al construir el cliente si no se le provee un transporte.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  realtime: { transport: WebSocket as any },
});

export const EVIDENCIAS_BUCKET = 'evidencias';
export const ACTAS_BUCKET = 'actas';
