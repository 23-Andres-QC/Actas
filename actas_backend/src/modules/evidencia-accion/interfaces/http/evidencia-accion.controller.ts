import { Request, Response } from 'express';
import { z } from 'zod';
import { SubirEvidenciaAccionUseCase } from '../../application/use-cases/subir-evidencia-accion.use-case';
import { ListarEvidenciasAccionUseCase } from '../../application/use-cases/listar-evidencias-accion.use-case';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

const subirLinkSchema = z.object({ url: z.string().url() });

export class EvidenciaAccionController {
  constructor(
    private readonly subirEvidencia: SubirEvidenciaAccionUseCase,
    private readonly listarEvidencias: ListarEvidenciasAccionUseCase,
  ) {}

  public subir = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const accionId = req.params.id as string;
    const datosComunes = { accionId, ejecutadoPorId: req.user.id, ejecutadoPorRol: req.user.rol };

    if (req.file) {
      await this.subirEvidencia.execute({
        ...datosComunes,
        tipo: 'archivo',
        archivo: req.file.buffer,
        mimeType: req.file.mimetype,
        nombreArchivo: req.file.originalname,
      });
    } else {
      const body = subirLinkSchema.parse(req.body);
      await this.subirEvidencia.execute({ ...datosComunes, tipo: 'link', url: body.url });
    }

    res.status(201).json({ ok: true });
  };

  public listar = async (req: Request, res: Response): Promise<void> => {
    const evidencias = await this.listarEvidencias.execute(req.params.id as string);
    res.json(evidencias);
  };
}
