import { AsistentesFirmadosProvider, AsistenteFirmadoInfo } from '../../domain/asistente-firmado.entity';

export class ListarAsistentesFirmadosUseCase {
  constructor(private readonly asistentesFirmadosProvider: AsistentesFirmadosProvider) {}

  public async execute(actaId: string): Promise<AsistenteFirmadoInfo[]> {
    return this.asistentesFirmadosProvider.obtenerPorActa(actaId);
  }
}
