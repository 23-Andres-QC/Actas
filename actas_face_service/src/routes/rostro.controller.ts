import { Request, Response } from 'express';
import { FaceEmbedderPort, RostroNoDetectadoError } from '../domain/face-embedder.port';
import { PostgresRostroRepository } from '../infrastructure/postgres-rostro.repository';
import { similitudCoseno } from '../domain/similitud';

const UMBRAL_SIMILITUD = Number(process.env.UMBRAL_SIMILITUD ?? '0.65');

export class RostroController {
  constructor(
    private readonly embedder: FaceEmbedderPort,
    private readonly rostroRepository: PostgresRostroRepository,
  ) {}

  public enrolar = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Falta el token de autenticación' } });
      return;
    }
    if (!req.file) {
      res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Debes adjuntar una foto en el campo "rostro"' } });
      return;
    }

    const embedding = await this.extraerEmbedding(req.file.buffer, res);
    if (!embedding) return;
    await this.rostroRepository.guardarEmbedding(req.user.id, embedding);
    res.status(201).json({ enrolado: true });
  };

  public verificar = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Falta el token de autenticación' } });
      return;
    }
    if (!req.file) {
      res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Debes adjuntar una foto en el campo "rostro"' } });
      return;
    }

    const referencia = await this.rostroRepository.obtenerEmbedding(req.user.id);
    if (!referencia) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No tienes un rostro enrolado todavía' } });
      return;
    }

    const embeddingActual = await this.extraerEmbedding(req.file.buffer, res);
    if (!embeddingActual) return;
    const similitud = similitudCoseno(referencia, embeddingActual);
    res.json({ coincide: similitud >= UMBRAL_SIMILITUD, similitud });
  };

  public estado = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Falta el token de autenticación' } });
      return;
    }
    const referencia = await this.rostroRepository.obtenerEmbedding(req.user.id);
    res.json({ enrolado: referencia !== null });
  };

  private async extraerEmbedding(imagenBuffer: Buffer, res: Response): Promise<number[] | null> {
    try {
      return await this.embedder.extraerEmbedding(imagenBuffer);
    } catch (error) {
      if (error instanceof RostroNoDetectadoError) {
        res.status(422).json({
          error: { code: 'FACE_NOT_DETECTED', message: error.message },
        });
        return null;
      }
      throw error;
    }
  }
}
