// face-api.js 0.22.x usa la API de TensorFlow.js 1.7. El paquete puro evita
// los binarios nativos obsoletos de tfjs-node y registra el backend CPU.
import '@tensorflow/tfjs';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const faceapi = require('face-api.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Canvas, Image, ImageData, loadImage } = require('@napi-rs/canvas');
import { FaceEmbedderPort, RostroNoDetectadoError } from '../domain/face-embedder.port';

// face-api.js crea internamente `new Canvas()`; napi-rs exige ancho y alto.
class FaceApiCanvas extends Canvas {
  constructor(width = 1, height = 1) {
    super(width, height);
  }
}

faceapi.env.monkeyPatch({ Canvas: FaceApiCanvas, Image, ImageData });

const MODEL_DIR = join(__dirname, '..', '..', 'assets', 'models');

/**
 * Usa los modelos pre-entrenados de face-api.js (MIT) descargados en assets/models/:
 * tiny_face_detector (ubica el rostro), face_landmark_68 (alinea el rostro) y
 * face_recognition_model (extrae el descriptor de 128 dimensiones). Pipeline estándar
 * de face-api.js — no es un modelo propio ni inventado.
 */
export class FaceApiEmbedder implements FaceEmbedderPort {
  private listo = false;

  public async cargar(): Promise<void> {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_DIR);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_DIR);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_DIR);
    this.listo = true;
  }

  public estaListo(): boolean {
    return this.listo;
  }

  public async extraerEmbedding(imagenBuffer: Buffer): Promise<number[]> {
    if (!this.listo) {
      throw new Error('Los modelos de reconocimiento facial no están cargados');
    }

    const imagen = await loadImage(imagenBuffer);
    const deteccion = await faceapi
      .detectSingleFace(imagen, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!deteccion) {
      throw new RostroNoDetectadoError();
    }

    return Array.from(deteccion.descriptor as Float32Array);
  }
}
