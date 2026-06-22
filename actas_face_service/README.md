# actas_face_service

Microservicio independiente de `actas_backend`, encargado únicamente del reconocimiento facial usado para firmar actas desde el móvil (reemplaza el `BiometricPrompt` nativo). Comparte la misma base de datos Postgres y el mismo `JWT_SECRET` que `actas_backend` — no tiene login propio, valida el token que ya emitió el backend principal.

## Falta el modelo (bloqueante)

Este servicio necesita un modelo de embeddings faciales en **formato TensorFlow.js** (`model.json` + archivos `.bin`) colocado en `assets/face_embedder/`. No viene incluido en el repo.

Cómo conseguirlo:
1. Descarga un modelo de embeddings faciales ya convertido a TF.js (ej. MobileFaceNet, FaceNet), o
2. Si solo tienes un `.tflite`, convviértelo una vez con `tensorflowjs_converter` (paquete `tensorflowjs` de Python) a formato TF.js Graph model.
3. Copia `model.json` y los `.bin` resultantes a `actas_face_service/assets/face_embedder/`.

Sin el modelo, el servicio levanta igual (`/health`, `/ready` funcionan) pero `/enrolar` y `/verificar` responden `503` hasta que el archivo esté presente.

## Endpoints

- `POST /enrolar` (multipart, campo `rostro`) — guarda el embedding de referencia del usuario autenticado.
- `POST /verificar` (multipart, campo `rostro`) — compara contra el embedding guardado, responde `{ coincide, similitud }`.
- `GET /estado` — `{ enrolado: boolean }`.

## Desarrollo local

```bash
npm install
cp .env.example .env   # ajusta DATABASE_URL/JWT_SECRET para que coincidan con actas_backend
npm run dev
```
