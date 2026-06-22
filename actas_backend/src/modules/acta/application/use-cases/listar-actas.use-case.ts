import { ActaRepository } from '../../domain/acta.repository';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

interface ListarActasInput {
  areaId?: string;
  ejecutadoPorId: string;
  ejecutadoPorRol: Rol;
}

export class ListarActasUseCase {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  public async execute(input: ListarActasInput): Promise<ActaResponseDTO[]> {
    let areaId = input.areaId;

    // Solo SuperAdmin ve actas de cualquier área; todos los demás quedan forzados a la suya,
    // sin importar lo que pidan por query param. El área se resuelve siempre desde Postgres
    // (fuente de verdad), nunca desde el JWT.
    if (input.ejecutadoPorRol !== 'superadmin') {
      const usuario = await this.usuarioRepository.findById(input.ejecutadoPorId);
      if (!usuario?.areaId) return [];
      areaId = usuario.areaId;
    }

    const actas = await this.actaRepository.findAll({ areaId });
    return actas.map((acta) => toActaResponseDTO(acta));
  }
}
