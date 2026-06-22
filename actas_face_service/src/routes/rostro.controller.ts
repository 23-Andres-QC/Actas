import { Request, Response } from 'express';
import { FaceEmbedderPort } from '../domain/face-embedder.port';
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

    const embedding = await this.embedder.extraerEmbedding(req.file.buffer);
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

    const embeddingActual = await this.embedder.extraerEmbedding(req.file.buffer);
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
}
