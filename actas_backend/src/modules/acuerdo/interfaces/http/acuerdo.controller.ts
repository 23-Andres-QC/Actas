import { Request, Response } from 'express';
import { CrearAcuerdoUseCase } from '../../application/use-cases/crear-acuerdo.use-case';
import { ListarAcuerdosPorActaUseCase } from '../../application/use-cases/listar-acuerdos-por-acta.use-case';
import { ListarAcuerdosPorResponsableUseCase } from '../../application/use-cases/listar-acuerdos-por-responsable.use-case';
import { ActualizarAvanceAcuerdoUseCase } from '../../application/use-cases/actualizar-avance-acuerdo.use-case';
import { EditarAcuerdoUseCase } from '../../application/use-cases/editar-acuerdo.use-case';
import { ReordenarAcuerdosUseCase } from '../../application/use-cases/reordenar-acuerdos.use-case';
import { crearAcuerdoSchema, actualizarAvanceSchema, editarAcuerdoSchema, reordenarSchema } from './acuerdo.validators';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

export class AcuerdoController {
  constructor(
    private readonly crearAcuerdo: CrearAcuerdoUseCase,
    private readonly listarPorActa: ListarAcuerdosPorActaUseCase,
    private readonly actualizarAvance: ActualizarAvanceAcuerdoUseCase,
    private readonly listarPorResponsable: ListarAcuerdosPorResponsableUseCase,
    private readonly editarAcuerdo: EditarAcuerdoUseCase,
    private readonly reordenarAcuerdos: ReordenarAcuerdosUseCase,
  ) {}

  public listarMios = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const acuerdos = await this.listarPorResponsable.execute(req.user.id);
    res.json(acuerdos);
  };

  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = crearAcuerdoSchema.parse({ ...req.body, actaId: req.params.actaId });
    const acuerdo = await this.crearAcuerdo.execute(body, req.user.id, req.user.rol);
    res.status(201).json(acuerdo);
  };

  public listarPorActaHandler = async (req: Request, res: Response): Promise<void> => {
    const acuerdos = await this.listarPorActa.execute(req.params.actaId as string);
    res.json(acuerdos);
  };

  public actualizarAvanceHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = actualizarAvanceSchema.parse(req.body);
    const acuerdo = await this.actualizarAvance.execute(
      req.params.id as string,
      body.porcentajeAvance,
      req.user.id,
      req.user.rol,
    );
    res.json(acuerdo);
  };

  public editarHandler = async (req: Request, res: Response): Promise<void> => {
    const body = editarAcuerdoSchema.parse(req.body);
    const acuerdo = await this.editarAcuerdo.execute(req.params.id as string, body);
    res.json(acuerdo);
  };

  public reordenarHandler = async (req: Request, res: Response): Promise<void> => {
    const body = reordenarSchema.parse(req.body);
    await this.reordenarAcuerdos.execute(body.items);
    res.json({ ok: true });
  };
}
