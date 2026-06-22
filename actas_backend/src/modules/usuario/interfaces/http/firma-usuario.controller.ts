import { Request, Response } from 'express';
import { GuardarFirmaUsuarioUseCase } from '../../application/use-cases/guardar-firma-usuario.use-case';
import { ObtenerFirmaUsuarioUseCase } from '../../application/use-cases/obtener-firma-usuario.use-case';
import { UnauthorizedError, ValidationError } from '../../../../shared/errors/domain-error';

export class FirmaUsuarioController {
  constructor(
    private readonly guardarFirmaUsuario: GuardarFirmaUsuarioUseCase,
    private readonly obtenerFirmaUsuario: ObtenerFirmaUsuarioUseCase,
  ) {}

  public guardarHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) throw new ValidationError('Debes adjuntar una imagen en el campo "firma"');

    const resultado = await this.guardarFirmaUsuario.execute(req.user.id, {
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });
    res.status(201).json(resultado);
  };

  public obtenerHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const resultado = await this.obtenerFirmaUsuario.execute(req.user.id);
    res.json(resultado);
  };
}
