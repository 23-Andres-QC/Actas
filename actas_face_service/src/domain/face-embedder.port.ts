/**
 * Puerto de extracción de embeddings faciales. La implementación concreta
 * (TfjsFaceEmbedder) depende del modelo .tflite/TF.js que se coloque en
 * assets/ — el resto del servicio no conoce esos detalles.
 */
export interface FaceEmbedderPort {
  extraerEmbedding(imagenBuffer: Buffer): Promise<number[]>;
}
