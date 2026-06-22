import { Request, Response } from 'express';
import { z } from 'zod';
import { CrearAreaUseCase, ListarAreasUseCase } from '../../application/area.use-cases';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

const crearAreaSchema = z.object({ nombre: z.string().trim().min(2).max(120) });

export class AreaController {
  constructor(private readonly listarAreas: ListarAreasUseCase, private readonly crearArea: CrearAreaUseCase) {}
  public listar = async (_req: Request, res: Response): Promise<void> => { res.json(await this.listarAreas.execute()); };
  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const { nombre } = crearAreaSchema.parse(req.body);
    res.status(201).json(await this.crearArea.execute(nombre, req.user.rol));
  };
}
