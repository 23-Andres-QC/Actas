import { Request, Response } from 'express';
import { SubirEvidenciaUseCase } from '../../application/use-cases/subir-evidencia.use-case';
import { ListarEvidenciasUseCase } from '../../application/use-cases/listar-evidencias.use-case';
import { ValidationError, UnauthorizedError } from '../../../../shared/errors/domain-error';

export class EvidenciaController {
  constructor(
    private readonly subirEvidencia: SubirEvidenciaUseCase,
    private readonly listarEvidencias: ListarEvidenciasUseCase,
  ) {}

  public subir = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) {
      throw new ValidationError('Debes adjuntar un archivo en el campo "archivo"');
    }

    await this.subirEvidencia.execute({
      acuerdoId: req.params.id as string,
      archivo: req.file.buffer,
      mimeType: req.file.mimetype,
      nombreArchivo: req.file.originalname,
      ejecutadoPorId: req.user.id,
      ejecutadoPorRol: req.user.rol,
    });

    res.status(201).json({ ok: true });
  };

  public listar = async (req: Request, res: Response): Promise<void> => {
    const evidencias = await this.listarEvidencias.execute(req.params.id as string);
    res.json(evidencias);
  };
}
