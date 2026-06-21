import { Request, Response } from 'express';
import { RegistrarAsistenciaUseCase } from '../../application/use-cases/registrar-asistencia.use-case';
import { registrarAsistenciaSchema } from './asistencia.validators';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

export class AsistenciaController {
  constructor(private readonly registrarAsistencia: RegistrarAsistenciaUseCase) {}

  public registrar = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = registrarAsistenciaSchema.parse(req.body);

    const resultado = await this.registrarAsistencia.execute(
      req.params.actaId as string,
      req.user.id,
      body.metodo,
      req.file ? { buffer: req.file.buffer, mimeType: req.file.mimetype } : undefined,
    );

    res.status(201).json({ ok: true, firmaUrl: resultado.firmaUrl });
  };
}
