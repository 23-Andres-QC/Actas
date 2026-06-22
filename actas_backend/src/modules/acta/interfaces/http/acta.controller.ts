import { Request, Response } from 'express';
import { CrearActaUseCase } from '../../application/use-cases/crear-acta.use-case';
import { ListarActasUseCase } from '../../application/use-cases/listar-actas.use-case';
import { ObtenerActaUseCase } from '../../application/use-cases/obtener-acta.use-case';
import { CalcularAvanceUseCase } from '../../application/use-cases/calcular-avance.use-case';
import { ListarAcuerdosPorActaUseCase } from '../../../acuerdo/application/use-cases/listar-acuerdos-por-acta.use-case';
import { SubirActaFisicaUseCase } from '../../application/use-cases/subir-acta-fisica.use-case';
import { ListarAsistentesFirmadosUseCase } from '../../../asistencia/application/use-cases/listar-asistentes-firmados.use-case';
import { crearActaSchema, listarActasQuerySchema } from './acta.validators';
import { UnauthorizedError, ValidationError } from '../../../../shared/errors/domain-error';
import { buildActaWordBuffer } from '../../infrastructure/acta-word.builder';

export class ActaController {
  constructor(
    private readonly crearActa: CrearActaUseCase,
    private readonly listarActas: ListarActasUseCase,
    private readonly obtenerActa: ObtenerActaUseCase,
    private readonly calcularAvance: CalcularAvanceUseCase,
    private readonly listarAcuerdosPorActa: ListarAcuerdosPorActaUseCase,
    private readonly subirActaFisica: SubirActaFisicaUseCase,
    private readonly listarAsistentesFirmados: ListarAsistentesFirmadosUseCase,
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

  public exportarWord = async (req: Request, res: Response): Promise<void> => {
    const actaId = req.params.id as string;
    const [acta, acuerdos, asistentes] = await Promise.all([
      this.obtenerActa.execute(actaId),
      this.listarAcuerdosPorActa.execute(actaId),
      this.listarAsistentesFirmados.execute(actaId),
    ]);
    const buffer = await buildActaWordBuffer(acta, acuerdos, asistentes);

    const nombreArchivo = `acta-${acta.titulo.replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase()}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send(buffer);
  };

  public subirActaFisicaHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) throw new ValidationError('Debes adjuntar un archivo en el campo "archivo"');

    const resultado = await this.subirActaFisica.execute(req.params.id as string, {
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });
    res.status(201).json(resultado);
  };
}
