# Despliegue en VPS

Puertos públicos:

- Web: `3001`
- Backend: `4000`
- Reconocimiento facial: `4100`
- PostgreSQL: sólo red interna de Docker

## Preparar variables

```bash
cp .env.example .env
cp actas_backend/.env.example actas_backend/.env
cp actas_face_service/.env.example actas_face_service/.env
```

Edita los tres archivos `.env`. `JWT_SECRET` debe ser idéntico en backend y servicio facial. En producción también debes reemplazar todas las contraseñas de ejemplo.

## Construir y levantar

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=100
```

## Verificar

```bash
curl http://localhost:4000/ready
curl http://localhost:4100/ready
curl -I http://localhost:3001
```
