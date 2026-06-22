import { existsSync } from 'fs';
import { join } from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { FaceEmbedderPort } from '../domain/face-embedder.port';

const MODEL_DIR = join(__dirname, '..', '..', 'assets', 'face_embedder');
const MODEL_PATH = `file://${join(MODEL_DIR, 'model.json')}`;

/**
 * Carga el modelo de embeddings faciales en formato TF.js (model.json + .bin) desde
 * assets/face_embedder/. NO viene incluido en el repo: hay que colocarlo ahí (ver README
 * de este servicio). Introspecciona la forma de entrada/salida del modelo en vez de
 * asumir dimensiones fijas, para no acoplarse a un modelo específico (MobileFaceNet, etc.).
 *
 * Asume que la imagen recibida ya viene razonablemente encuadrada en el rostro (la UI
 * del móvil guía al usuario a centrarlo) — no hace detección/recorte de rostro server-side.
 */
export class TfjsFaceEmbedder implements FaceEmbedderPort {
  private modelo: tf.GraphModel | null = null;
  private alturaEntrada = 112;
  private anchoEntrada = 112;

  public async cargar(): Promise<void> {
    if (!existsSync(join(MODEL_DIR, 'model.json'))) {
      throw new Error(
        `No se encontró el modelo en ${MODEL_DIR}/model.json. Coloca ahí el modelo de embeddings faciales (formato TF.js) antes de iniciar este servicio.`,
      );
    }
    this.modelo = await tf.loadGraphModel(MODEL_PATH);

    const forma = this.modelo.inputs[0]?.shape;
    if (forma && forma.length === 4) {
      this.alturaEntrada = forma[1] && forma[1] > 0 ? forma[1] : this.alturaEntrada;
      this.anchoEntrada = forma[2] && forma[2] > 0 ? forma[2] : this.anchoEntrada;
    }
  }

  public estaListo(): boolean {
    return this.modelo !== null;
  }

  public async extraerEmbedding(imagenBuffer: Buffer): Promise<number[]> {
    if (!this.modelo) {
      throw new Error('El modelo de reconocimiento facial no está cargado');
    }

    const embedding = tf.tidy(() => {
      const decodificada = tf.node.decodeImage(imagenBuffer, 3) as tf.Tensor3D;
      const redimensionada = tf.image.resizeBilinear(decodificada, [this.alturaEntrada, this.anchoEntrada]);
      const normalizada = redimensionada.div(255).expandDims(0);
      const salida = this.modelo!.predict(normalizada) as tf.Tensor;
      return salida.reshape([-1]);
    });

    const valores = await embedding.array();
    embedding.dispose();
    return valores as number[];
  }
}
