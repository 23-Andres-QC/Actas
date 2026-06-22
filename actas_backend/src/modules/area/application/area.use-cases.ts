import { ConflictError, ForbiddenError } from '../../../shared/errors/domain-error';
import { Rol } from '../../../infrastructure/http/middlewares/auth.middleware';
import { Area } from '../domain/area.entity';
import { AreaRepository } from '../domain/area.repository';

export interface AreaDTO { id: string; nombre: string }
const toDTO = (area: Area): AreaDTO => ({ id: area.id, nombre: area.nombre });

export class ListarAreasUseCase {
  constructor(private readonly repository: AreaRepository) {}
  public async execute(): Promise<AreaDTO[]> { return (await this.repository.findAll()).map(toDTO); }
}

export class CrearAreaUseCase {
  constructor(private readonly repository: AreaRepository) {}
  public async execute(nombre: string, ejecutadoPorRol: Rol): Promise<AreaDTO> {
    if (ejecutadoPorRol !== 'superadmin') throw new ForbiddenError('Solo el SuperAdmin puede crear áreas');
    if (await this.repository.findByName(nombre)) throw new ConflictError('Ya existe un área con este nombre');
    const area = Area.create(nombre);
    await this.repository.save(area);
    return toDTO(area);
  }
}
