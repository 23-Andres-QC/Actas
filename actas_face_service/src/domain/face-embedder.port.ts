/**
 * Puerto de extracción de embeddings faciales. La implementación concreta
 * La implementación concreta encapsula el pipeline de detección, alineación
 * y descripción; el resto del servicio no conoce esos detalles.
 */
export class RostroNoDetectadoError extends Error {
  constructor(message = 'No se detectó un rostro en la imagen. Acércate más a la cámara y mejora la iluminación.') {
    super(message);
    this.name = 'RostroNoDetectadoError';
  }
}

export interface FaceEmbedderPort {
  extraerEmbedding(imagenBuffer: Buffer): Promise<number[]>;
}
