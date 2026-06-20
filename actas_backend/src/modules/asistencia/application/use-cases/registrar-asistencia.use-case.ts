import { randomUUID } from 'crypto';
import { AsistenciaRepository } from '../../domain/asistencia.repository';
import { Asistencia, MetodoAsistencia } from '../../domain/asistencia.entity';

export class RegistrarAsistenciaUseCase {
  constructor(private readonly asistenciaRepository: AsistenciaRepository) {}

  public async execute(actaId: string, usuarioId: string, metodo: MetodoAsistencia): Promise<void> {
    const asistencia = Asistencia.registrar({ actaId, usuarioId, metodo }, randomUUID());
    await this.asistenciaRepository.save(asistencia);
  }
}
