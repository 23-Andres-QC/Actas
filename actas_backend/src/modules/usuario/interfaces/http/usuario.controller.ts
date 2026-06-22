import { Request, Response } from 'express';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { AsignarRolUseCase } from '../../application/use-cases/asignar-rol.use-case';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { asignarRolSchema, crearUsuarioSchema, listarUsuariosQuerySchema } from './usuario.validators';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

export class UsuarioController {
  constructor(
    private readonly listarUsuarios: ListarUsuariosUseCase,
    private readonly asignarRol: AsignarRolUseCase,
    private readonly crearUsuario: CrearUsuarioUseCase,
  ) {}

  public listar = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const query = listarUsuariosQuerySchema.parse(req.query);
    const usuarios = await this.listarUsuarios.execute({
      ...query,
      ejecutadoPorId: req.user.id,
      ejecutadoPorRol: req.user.rol,
    });
    res.json(usuarios);
  };

  public asignarRolHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = asignarRolSchema.parse(req.body);

    const usuario = await this.asignarRol.execute({
      usuarioObjetivoId: req.params.id as string,
      nuevoRol: body.rol,
      ejecutadoPorId: req.user.id,
      ejecutadoPorRol: req.user.rol,
    });

    res.json(usuario);
  };

  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = crearUsuarioSchema.parse(req.body);
    const usuario = await this.crearUsuario.execute({
      ...body,
      areaId: body.areaId ?? null,
      cargo: body.cargo ?? null,
      ejecutadoPorRol: req.user.rol,
    });
    res.status(201).json(usuario);
  };
}
