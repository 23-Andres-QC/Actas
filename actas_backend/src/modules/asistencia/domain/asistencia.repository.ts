import { Asistencia } from './asistencia.entity';

export interface AsistenciaRepository {
  findByActaId(actaId: string): Promise<Asistencia[]>;
  save(asistencia: Asistencia): Promise<void>;
}
