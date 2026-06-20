import { randomUUID } from 'crypto';
import { EvidenciaRepository } from '../../domain/evidencia.repository';
import { Evidencia } from '../../domain/evidencia.entity';
import { StoragePort } from '../../domain/storage.port';
import { ValidationError } from '../../../../shared/errors/domain-error';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'application/pdf', 'video/mp4'];
const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB

interface SubirEvidenciaInput {
  acuerdoId: string;
  archivo: Buffer;
  mimeType: string;
  nombreArchivo: string;
}

export class SubirEvidenciaUseCase {
  constructor(
    private readonly evidenciaRepository: EvidenciaRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(input: SubirEvidenciaInput): Promise<void> {
    if (!TIPOS_PERMITIDOS.includes(input.mimeType)) {
      throw new ValidationError(`Tipo de archivo no permitido: ${input.mimeType}`);
    }
    if (input.archivo.byteLength > TAMANO_MAXIMO_BYTES) {
      throw new ValidationError('El archivo excede el tamaño máximo de 25MB');
    }

    const path = `${input.acuerdoId}/${randomUUID()}-${input.nombreArchivo}`;
    const url = await this.storage.subirArchivo('evidencias', path, input.archivo, input.mimeType);

    const evidencia = Evidencia.subir({ acuerdoId: input.acuerdoId, urlArchivo: url }, randomUUID());
    await this.evidenciaRepository.save(evidencia);
  }
}
