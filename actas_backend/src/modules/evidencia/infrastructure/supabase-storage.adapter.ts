import { StoragePort } from '../domain/storage.port';
import { supabaseAdmin } from '../../../infrastructure/supabase/client';

export class SupabaseStorageAdapter implements StoragePort {
  public async subirArchivo(bucket: string, path: string, contenido: Buffer, mimeType: string): Promise<string> {
    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, contenido, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) {
      throw new Error(`Error subiendo archivo a Supabase Storage: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
