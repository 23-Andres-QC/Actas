export interface ActaDocumentoInfo {
  actaId: string;
  path: string;
  /** Cambia en cada guardado; OnlyOffice lo usa para saber si debe recargar el documento. */
  version: string;
  updatedAt: Date;
}

export interface ActaDocumentoRepository {
  findByActaId(actaId: string): Promise<ActaDocumentoInfo | null>;
  guardar(info: ActaDocumentoInfo): Promise<void>;
}
