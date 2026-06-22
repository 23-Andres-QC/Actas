# actas_face_service

Microservicio de reconocimiento facial para la firma de actas desde la aplicación móvil. Comparte PostgreSQL y `JWT_SECRET` con `actas_backend`.

## Reconocimiento facial

El servicio usa `face-api.js` con el pipeline detector → landmarks → descriptor facial de 128 dimensiones. Los modelos requeridos están en `assets/models/`:

- `tiny_face_detector`
- `face_landmark_68`
- `face_recognition_model`

TensorFlow.js 1.7 se ejecuta con el backend CPU en JavaScript y `@napi-rs/canvas`, evitando dependencias nativas antiguas incompatibles con Node 20.

Si los modelos no cargan, `/enrolar` y `/verificar` responden `503`. Si no se detecta un rostro, responden `422` con el código `FACE_NOT_DETECTED`.

## Endpoints

- `POST /enrolar` (multipart, campo `rostro`): guarda el descriptor de referencia.
- `POST /verificar` (multipart, campo `rostro`): compara contra el descriptor guardado.
- `GET /estado`: responde `{ enrolado: boolean }`.
- `GET /health`: comprueba el proceso HTTP.
- `GET /ready`: comprueba PostgreSQL y la carga de modelos.

## Desarrollo local

```bash
npm install
npm run build
npm run lint
npm run dev
```

## Docker

Desde la raíz del repositorio:

```bash
docker compose build face-service
docker compose up -d face-service
```
