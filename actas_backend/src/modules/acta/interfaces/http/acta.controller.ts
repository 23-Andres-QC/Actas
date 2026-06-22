import { Request, Response } from 'express';
import { CrearActaUseCase } from '../../application/use-cases/crear-acta.use-case';
import { ListarActasUseCase } from '../../application/use-cases/listar-actas.use-case';
import { ObtenerActaUseCase } from '../../application/use-cases/obtener-acta.use-case';
import { CalcularAvanceUseCase } from '../../application/use-cases/calcular-avance.use-case';
import { ListarAcuerdosPorActaUseCase } from '../../../acuerdo/application/use-cases/listar-acuerdos-por-acta.use-case';
import { SubirActaFisicaUseCase } from '../../application/use-cases/subir-acta-fisica.use-case';
import { ListarAsistentesFirmadosUseCase } from '../../../asistencia/application/use-cases/listar-asistentes-firmados.use-case';
import { ObtenerDocumentoEditableUseCase } from '../../application/use-cases/obtener-documento-editable.use-case';
import { GuardarDocumentoEditableUseCase } from '../../application/use-cases/guardar-documento-editable.use-case';
import { RegenerarDocumentoEditableUseCase } from '../../application/use-cases/regenerar-documento-editable.use-case';
import { crearActaSchema, listarActasQuerySchema } from './acta.validators';
import { UnauthorizedError, ValidationError } from '../../../../shared/errors/domain-error';
import { buildActaWordBuffer } from '../../infrastructure/acta-word.builder';
import { construirConfigDocumentoEditable, verificarTokenCallback, forzarGuardado } from '../../../../infrastructure/onlyoffice/onlyoffice-config';

export class ActaController {
  constructor(
    private readonly crearActa: CrearActaUseCase,
    private readonly listarActas: ListarActasUseCase,
    private readonly obtenerActa: ObtenerActaUseCase,
    private readonly calcularAvance: CalcularAvanceUseCase,
    private readonly listarAcuerdosPorActa: ListarAcuerdosPorActaUseCase,
    private readonly subirActaFisica: SubirActaFisicaUseCase,
    private readonly listarAsistentesFirmados: ListarAsistentesFirmadosUseCase,
    private readonly obtenerDocumentoEditable: ObtenerDocumentoEditableUseCase,
    private readonly guardarDocumentoEditable: GuardarDocumentoEditableUseCase,
    private readonly regenerarDocumentoEditable: RegenerarDocumentoEditableUseCase,
  ) {}

  public crear = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const body = crearActaSchema.parse(req.body);

    const acta = await this.crearActa.execute({
      ...body,
      convocadorId: req.user.id,
      ejecutadoPorRol: req.user.rol,
    });
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
    const actasConFirma = await Promise.all(
      actas.map(async (acta) => {
        const asistentes = await this.listarAsistentesFirmados.execute(acta.id);
        return { ...acta, firmado: asistentes.some((asistente) => asistente.usuarioId === req.user!.id) };
      }),
    );
    res.json(actasConFirma);
  };

  public detalle = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const acta = await this.obtenerActa.execute(req.params.id as string, req.user.id, req.user.rol);
    res.json(acta);
  };

  public avance = async (req: Request, res: Response): Promise<void> => {
    const acta = await this.calcularAvance.execute(req.params.id as string);
    res.json({ porcentajeAvance: acta.porcentajeAvance });
  };

  public exportarWord = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const actaId = req.params.id as string;
    const [acta, acuerdos, asistentes] = await Promise.all([
      this.obtenerActa.execute(actaId, req.user.id, req.user.rol),
      this.listarAcuerdosPorActa.execute(actaId),
      this.listarAsistentesFirmados.execute(actaId),
    ]);
    const buffer = await buildActaWordBuffer(acta, acuerdos, asistentes);

    const nombreArchivo = `acta-${acta.titulo.replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase()}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send(buffer);
  };

  public obtenerDocumentoEditableHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const actaId = req.params.id as string;
    const info = await this.obtenerDocumentoEditable.execute(actaId, req.user.id, req.user.rol);
    res.json(this.armarRespuestaDocumento(actaId, info, req.user));
  };

  /** Fuerza la reconstrucción del .docx con los datos actuales (acuerdos, asistentes), pisando ediciones manuales previas. */
  public regenerarDocumentoEditableHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const actaId = req.params.id as string;
    await this.regenerarDocumentoEditable.execute(actaId, req.user.id, req.user.rol);
    const info = await this.obtenerDocumentoEditable.execute(actaId, req.user.id, req.user.rol);
    res.json(this.armarRespuestaDocumento(actaId, info, req.user));
  };

  /** Botón "Guardar" del editor: fuerza que OnlyOffice guarde ya lo que el usuario escribió a mano, sin esperar al autosave. */
  public guardarDocumentoEditableHandler = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new UnauthorizedError();
    const actaId = req.params.id as string;
    const info = await this.obtenerDocumentoEditable.execute(actaId, req.user.id, req.user.rol);
    await forzarGuardado(info.key);
    res.json({ ok: true });
  };

  private armarRespuestaDocumento(
    actaId: string,
    info: { url: string; key: string; titulo: string },
    usuario: { id: string; email: string },
  ) {
    const config = construirConfigDocumentoEditable({
      actaId,
      documentUrl: info.url,
      key: info.key,
      titulo: info.titulo,
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
    });
    return { documentServerUrl: process.env.ONLYOFFICE_PUBLIC_URL ?? '', config };
  }

  /** Llamado por OnlyOffice Document Server, no por el frontend: no lleva nuestro authMiddleware. */
  public guardarDocumentoEditableCallbackHandler = async (req: Request, res: Response): Promise<void> => {
    if (!verificarTokenCallback(req.headers.authorization)) {
      res.status(403).json({ error: 1 });
      return;
    }
    const { status, url } = req.body as { status: number; url?: string };
    if ((status === 2 || status === 6) && url) {
      await this.guardarDocumentoEditable.execute(req.params.actaId as string, url);
    }
    res.json({ error: 0 });
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
