import { StoragePort } from '../domain/storage.port';
import { supabaseAdmin } from '../../../infrastructure/supabase/client';

/** Los buckets de evidencias/firmas/actas son privados: se accede vía URL firmada, nunca pública. */
const EXPIRACION_URL_FIRMADA_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

export class SupabaseStorageAdapter implements StoragePort {
  public async subirArchivo(bucket: string, path: string, contenido: Buffer, mimeType: string): Promise<string> {
    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, contenido, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) {
      throw new Error(`Error subiendo archivo a Supabase Storage: ${error.message}`);
    }

    const { data, error: signError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, EXPIRACION_URL_FIRMADA_SEGUNDOS);
    if (signError || !data) {
      throw new Error(`Error generando URL firmada: ${signError?.message}`);
    }

    return data.signedUrl;
  }
}
