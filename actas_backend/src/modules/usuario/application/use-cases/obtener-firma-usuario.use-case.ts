import { FirmaUsuarioRepository } from '../../domain/firma-usuario.repository';

export class ObtenerFirmaUsuarioUseCase {
  constructor(private readonly firmaUsuarioRepository: FirmaUsuarioRepository) {}

  public async execute(usuarioId: string): Promise<{ firmaUrl: string | null }> {
    const firmaUrl = await this.firmaUsuarioRepository.obtenerPorUsuario(usuarioId);
    return { firmaUrl };
  }
}
