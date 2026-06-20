# Base de Datos

## Tecnología

- **Motor:** PostgreSQL
- **Contenedor:** Docker
- **Auth/Storage gestionados por:** Supabase (usuarios, sesiones, archivos)
- **Identificadores:** todas las tablas usan `UUID` (tipo `uuid`, generado con `gen_random_uuid()` / `uuidv4()`) como clave primaria en lugar de `serial`/`bigint` autoincremental.
  - Evita IDs predecibles/enumerables (mitiga ataques de enumeración de recursos, ej. `GET /api/actas/2` → `/3` → `/4`).
  - Coincide con el formato de `auth.users.id` de Supabase, simplificando el FK `usuario.id` ↔ `auth.users.id`.
  - Permite generar IDs en el cliente/backend antes del insert sin depender de un round-trip a la BD.

## Entidades principales

| Entidad | Descripción | Campos clave |
|---|---|---|
| `usuario` | Miembro de la comunidad académica | id (uuid, FK a `auth.users.id`), nombre, email, rol (superadmin/admin/convocador/asistente), area_id (uuid) |
| `area` | Área institucional | id (uuid), nombre |
| `acta` | Acta de reunión | id (uuid), area_id (uuid), convocador_id (uuid), fecha, formato (estandar/ai), url_grabacion, url_acta_fisica, porcentaje_avance |
| `acuerdo` | Compromiso registrado en un acta | id (uuid), acta_id (uuid), responsable_id (uuid), descripcion, fecha_inicio, fecha_fin, estado_semaforo (verde/amarillo/rojo), porcentaje_avance |
| `evidencia_acuerdo` | Evidencia de cumplimiento de un acuerdo | id (uuid), acuerdo_id (uuid), url_archivo, fecha_subida |
| `asistencia` | Registro de asistencia a una reunión | id (uuid), acta_id (uuid), usuario_id (uuid), metodo (qr/firma_facial), fecha_hora |
| `inasistente` | Asistente que no asistió | id (uuid), acta_id (uuid), usuario_id (uuid), evidencia_url |
| `evidencia_reunion` | Multimedia general de la reunión | id (uuid), acta_id (uuid), tipo (foto/video/url_grabacion), url |
| `audit_log` | Trazabilidad de acciones | id (uuid), usuario_id (uuid), entidad, entidad_id (uuid), accion, fecha_hora |

## Relaciones

- `area` 1—N `usuario`
- `area` 1—N `acta`
- `acta` 1—N `acuerdo`
- `acuerdo` 1—N `evidencia_acuerdo`
- `acta` 1—N `asistencia`
- `acta` 1—N `inasistente`
- `acta` 1—N `evidencia_reunion`
- `usuario` 1—N `acuerdo` (como responsable)

## Resumen general de APIs

| Dominio | Endpoints clave | Detalle |
|---|---|---|
| Auth | `/api/auth/*` | Login, recuperación, registro (Supabase) |
| Usuarios | `/api/usuarios/*` | CRUD, asignación de roles y áreas |
| Actas | `/api/actas/*` | Crear, listar, detalle, % avance, acta física, match AI |
| Acuerdos | `/api/acuerdos/*` | Crear, detalle, actualizar, subir/ver evidencias |
| Asistencia | `/api/actas/:id/asistencia/*` | QR, firma facial, inasistentes |
| Evidencias de reunión | `/api/actas/:id/grabacion`, `/multimedia` | URL de grabación, fotos/videos |

Ver detalle completo de cada endpoint en [backend.md](backend.md).
