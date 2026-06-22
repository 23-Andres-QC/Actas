import { AccionRepository } from '../../domain/accion.repository';

export class ReordenarAccionesUseCase {
  constructor(private readonly accionRepository: AccionRepository) {}

  public async execute(items: { id: string; orden: number }[]): Promise<void> {
    await this.accionRepository.reordenar(items);
  }
}
