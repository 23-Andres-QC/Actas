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

    // Un Admin solo puede ver actas de su propia área, sin importar lo que pida por query param.
    // El área se resuelve siempre desde Postgres (fuente de verdad), nunca desde el JWT.
    if (input.ejecutadoPorRol === 'admin') {
      const usuario = await this.usuarioRepository.findById(input.ejecutadoPorId);
      areaId = usuario?.areaId ?? undefined;
    }

    const actas = await this.actaRepository.findAll({ areaId });
    return actas.map((acta) => toActaResponseDTO(acta));
  }
}
