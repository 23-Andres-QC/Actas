import { Request, Response } from 'express';
import { z } from 'zod';
import { SubirEvidenciaActaUseCase } from '../../application/use-cases/subir-evidencia-acta.use-case';
import { ListarEvidenciasActaUseCase } from '../../application/use-cases/listar-evidencias-acta.use-case';

const subirLinkSchema = z.object({ url: z.string().url() });

export class EvidenciaActaController {
  constructor(
    private readonly subirEvidencia: SubirEvidenciaActaUseCase,
    private readonly listarEvidencias: ListarEvidenciasActaUseCase,
  ) {}

  public subir = async (req: Request, res: Response): Promise<void> => {
    const actaId = req.params.id as string;

    if (req.file) {
      await this.subirEvidencia.execute({
        actaId,
        tipo: 'archivo',
        archivo: req.file.buffer,
        mimeType: req.file.mimetype,
        nombreArchivo: req.file.originalname,
      });
    } else {
      const body = subirLinkSchema.parse(req.body);
      await this.subirEvidencia.execute({ actaId, tipo: 'link', url: body.url });
    }

    res.status(201).json({ ok: true });
  };

  public listar = async (req: Request, res: Response): Promise<void> => {
    const evidencias = await this.listarEvidencias.execute(req.params.id as string);
    res.json(evidencias);
  };
}
