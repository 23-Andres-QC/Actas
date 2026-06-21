import { Request, Response } from 'express';
import { RegistrarAsistenciaUseCase } from '../../application/use-cases/registrar-asistencia.use-case';
import { ListarInasistentesUseCase } from '../../application/use-cases/listar-inasistentes.use-case';
import { SubirEvidenciaInasistenciaUseCase } from '../../application/use-cases/subir-evidencia-inasistencia.use-case';
import { ListarAsistentesFirmadosUseCase } from '../../application/use-cases/listar-asistentes-firmados.use-case';
import { registrarAsistenciaSchema } from './asistencia.validators';
import { UnauthorizedError, ValidationError } from '../../../../shared/errors/domain-error';

export class AsistenciaController {
  constructor(
    private readonly registrarAsistencia: RegistrarAsistenciaUseCase,
    private readonly listarInasistentes: ListarInasistentesUseCase,
    private readonly subirEvidenciaInasistencia: SubirEvidenciaInasistenciaUseCase,
    private readonly listarAsistentesFirmados: ListarAsistentesFirmadosUseCase,
  ) {}

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

  public listarInasistentesHandler = async (req: Request, res: Response): Promise<void> => {
    const inasistentes = await this.listarInasistentes.execute(req.params.actaId as string);
    res.json(inasistentes);
  };

  public listarAsistentesFirmadosHandler = async (req: Request, res: Response): Promise<void> => {
    const asistentes = await this.listarAsistentesFirmados.execute(req.params.actaId as string);
    res.json(asistentes);
  };

  public subirEvidenciaInasistenciaHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) throw new ValidationError('Debes adjuntar un archivo en el campo "archivo"');

    const resultado = await this.subirEvidenciaInasistencia.execute(
      req.params.actaId as string,
      req.params.usuarioId as string,
      { buffer: req.file.buffer, mimeType: req.file.mimetype },
    );

    res.status(201).json(resultado);
  };
}
