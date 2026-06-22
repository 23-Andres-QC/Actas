import { MetodoAsistencia } from './asistencia.entity';

export interface AsistenteFirmadoInfo {
  usuarioId: string;
  nombre: string;
  email: string;
  cargo: string | null;
  metodo: MetodoAsistencia;
  fechaHora: string;
  firmaUrl: string | null;
}

/** Puerto: lista los usuarios que ya registraron su asistencia/firma en un acta. */
export interface AsistentesFirmadosProvider {
  obtenerPorActa(actaId: string): Promise<AsistenteFirmadoInfo[]>;
}
