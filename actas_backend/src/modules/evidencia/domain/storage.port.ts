/** Puerto de almacenamiento de archivos; el adaptador real usa Supabase Storage. */
export interface StoragePort {
  subirArchivo(bucket: string, path: string, contenido: Buffer, mimeType: string): Promise<string>;
  eliminarArchivo(bucket: string, path: string): Promise<void>;
}
