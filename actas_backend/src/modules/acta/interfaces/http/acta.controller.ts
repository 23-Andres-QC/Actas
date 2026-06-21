import { Request, Response } from 'express';
import { CrearActaUseCase } from '../../application/use-cases/crear-acta.use-case';
import { ListarActasUseCase } from '../../application/use-cases/listar-actas.use-case';
import { ObtenerActaUseCase } from '../../application/use-cases/obtener-acta.use-case';
import { CalcularAvanceUseCase } from '../../application/use-cases/calcular-avance.use-case';
import { crearActaSchema, listarActasQuerySchema } from './acta.validators';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

export class ActaController {
  constructor(
    private readonly crearActa: CrearActaUseCase,
    private readonly listarActas: ListarActasUseCase,
    private readonly obtenerActa: ObtenerActaUseCase,
    private readonly calcularAvance: CalcularAvanceUseCase,
  ) {}

  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = crearActaSchema.parse(req.body);

    const acta = await this.crearActa.execute({ ...body, convocadorId: req.user.id });
    res.status(201).json(acta);
  };

  public listar = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const query = listarActasQuerySchema.parse(req.query);
    const actas = await this.listarActas.execute({
      ...query,
      ejecutadoPorId: req.user.id,
      ejecutadoPorRol: req.user.rol,
    });
    res.json(actas);
  };

  public detalle = async (req: Request, res: Response): Promise<void> => {
    const acta = await this.obtenerActa.execute(req.params.id as string);
    res.json(acta);
  };

  public avance = async (req: Request, res: Response): Promise<void> => {
    const acta = await this.calcularAvance.execute(req.params.id as string);
    res.json({ porcentajeAvance: acta.porcentajeAvance });
  };
}
