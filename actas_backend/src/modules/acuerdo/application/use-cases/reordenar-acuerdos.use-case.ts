import { AcuerdoRepository } from '../../domain/acuerdo.repository';

export class ReordenarAcuerdosUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository) {}

  public async execute(items: { id: string; orden: number }[]): Promise<void> {
    await this.acuerdoRepository.reordenar(items);
  }
}
