/** Puerto de almacenamiento de archivos; el adaptador real usa Supabase Storage. */
export interface StoragePort {
  subirArchivo(bucket: string, path: string, contenido: Buffer, mimeType: string): Promise<string>;
  /** Sobrescribe un archivo ya existente (upsert) — usado para guardar ediciones del documento de OnlyOffice. */
  reemplazarArchivo(bucket: string, path: string, contenido: Buffer, mimeType: string): Promise<string>;
  obtenerUrlFirmada(bucket: string, path: string): Promise<string>;
  eliminarArchivo(bucket: string, path: string): Promise<void>;
}
