import { Request, Response } from 'express';
import { CrearAccionUseCase } from '../../application/use-cases/crear-accion.use-case';
import { ListarAccionesPorAcuerdoUseCase } from '../../application/use-cases/listar-acciones-por-acuerdo.use-case';
import { ActualizarCompletadaAccionUseCase } from '../../application/use-cases/actualizar-completada-accion.use-case';
import { EditarAccionUseCase } from '../../application/use-cases/editar-accion.use-case';
import { ReordenarAccionesUseCase } from '../../application/use-cases/reordenar-acciones.use-case';
import { crearAccionSchema, actualizarCompletadaSchema, editarAccionSchema, reordenarAccionesSchema } from './accion.validators';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';

export class AccionController {
  constructor(
    private readonly crearAccion: CrearAccionUseCase,
    private readonly listarPorAcuerdo: ListarAccionesPorAcuerdoUseCase,
    private readonly actualizarCompletada: ActualizarCompletadaAccionUseCase,
    private readonly editarAccion: EditarAccionUseCase,
    private readonly reordenarAcciones: ReordenarAccionesUseCase,
  ) {}

  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = crearAccionSchema.parse(req.body);
    const accion = await this.crearAccion.execute(
      req.params.acuerdoId as string,
      body.descripcion,
      body.fechaFin,
      req.user.id,
      req.user.rol,
    );
    res.status(201).json(accion);
  };

  public listarPorAcuerdoHandler = async (req: Request, res: Response): Promise<void> => {
    const acciones = await this.listarPorAcuerdo.execute(req.params.acuerdoId as string);
    res.json(acciones);
  };

  public actualizarCompletadaHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = actualizarCompletadaSchema.parse(req.body);
    const accion = await this.actualizarCompletada.execute(
      req.params.id as string,
      body.completada,
      req.user.id,
      req.user.rol,
    );
    res.json(accion);
  };

  public editarHandler = async (req: Request, res: Response): Promise<void> => {
    const body = editarAccionSchema.parse(req.body);
    const accion = await this.editarAccion.execute(req.params.id as string, body);
    res.json(accion);
  };

  public reordenarHandler = async (req: Request, res: Response): Promise<void> => {
    const body = reordenarAccionesSchema.parse(req.body);
    await this.reordenarAcciones.execute(body.items);
    res.json({ ok: true });
  };
}
