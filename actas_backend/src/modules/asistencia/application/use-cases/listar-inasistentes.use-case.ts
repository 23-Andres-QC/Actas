import { InasistentesProvider, InasistenteInfo } from '../../domain/inasistente.entity';

export class ListarInasistentesUseCase {
  constructor(private readonly inasistentesProvider: InasistentesProvider) {}

  public async execute(actaId: string): Promise<InasistenteInfo[]> {
    return this.inasistentesProvider.obtenerPorActa(actaId);
  }
}
