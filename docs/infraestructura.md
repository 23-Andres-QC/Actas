# Infraestructura y Seguridad

## Arquitectura general

```
┌────────────┐      HTTPS       ┌────────────┐      SQL        ┌────────────┐
│  Frontend  │ ───────────────▶ │  Backend   │ ───────────────▶│  Postgres  │
│  (React)   │                  │ (Express)  │                  │  (Docker)  │
└────────────┘                  └─────┬──────┘                  └────────────┘
┌────────────┐                        │
│  Mobile    │ ───────────────────────┤
│  (Kotlin)  │                        │
└────────────┘                        ▼
                                ┌────────────┐
                                │  Supabase  │
                                │ Auth/Storage│
                                └────────────┘
```

- Cada capa (web, backend, BD) corre en su propio contenedor Docker, orquestados vía `docker-compose` con redes internas aisladas (la BD no se expone fuera de la red interna del backend).
- El backend es el único componente con credenciales de servicio (service role) de Supabase; frontend y mobile usan únicamente la clave pública (anon key) + JWT del usuario.

## Autenticación y autorización

- **Autenticación:** Supabase Auth emite JWT al iniciar sesión. Frontend y mobile envían el JWT en `Authorization: Bearer <token>` en cada request al backend.
- **Verificación de token:** el backend valida la firma del JWT contra la clave pública de Supabase en cada request (middleware de autenticación), nunca confía en datos del cliente.
- **RBAC (Role-Based Access Control):** los 4 roles (SuperAdmin, Admin, Convocador, Asistente) se almacenan en la tabla `usuario.rol` y se verifican con un middleware de autorización por endpoint:

| Rol | Alcance de datos |
|---|---|
| SuperAdmin | Todas las áreas |
| Admin | Solo su(s) área(s) asignada(s) |
| Convocador | Solo las actas que convoca |
| Asistente | Solo sus propios acuerdos y asistencias |

- **Row Level Security (RLS) en Postgres:** además del control en el backend, se habilita RLS por tabla (`acta`, `acuerdo`, `evidencia_*`) filtrando por `area_id` / `usuario_id`, como segunda capa de defensa si Supabase accede directo a la BD.
- **Recuperación de contraseña:** flujo estándar de Supabase (link de un solo uso con expiración corta, enviado por correo institucional).
- **MFA opcional:** recomendado para SuperAdmin y Admin dado su acceso amplio.

## Cifrado

- **En tránsito:** TLS/HTTPS obligatorio en todas las comunicaciones (frontend↔backend, mobile↔backend, backend↔Supabase). Sin HTTP plano ni en desarrollo con datos reales.
- **En reposo:** cifrado nativo de Postgres (volumen Docker cifrado a nivel de disco) y cifrado de Supabase Storage para evidencias y actas físicas.
- **Datos biométricos (reconocimiento facial):** no se almacena la imagen facial cruda más allá del proceso de verificación puntual; solo se persiste el resultado de la validación (match/no match) y, si se requiere evidencia, la foto se guarda cifrada en Storage con acceso restringido por firma de URL temporal.

## Validación de entrada y protección OWASP Top 10

| Riesgo OWASP | Mitigación aplicada |
|---|---|
| Injection (SQL) | ORM/query builder con parámetros (no concatenación de SQL), validación de esquemas de entrada (ej. Zod/Joi) en cada endpoint |
| Broken Authentication | Delegado a Supabase Auth + verificación de JWT en cada request, expiración y refresh tokens |
| Broken Access Control | Middleware RBAC + RLS en Postgres (defensa en profundidad) |
| Sensitive Data Exposure | TLS, cifrado en reposo, no se loguean tokens ni contraseñas |
| Security Misconfiguration | Variables sensibles solo en `.env`/secretos de Docker, nunca en el repositorio; headers de seguridad (Helmet) en Express |
| XSS | React escapa por defecto; sanitización de inputs en formato de acta generado con AI antes de renderizar |
| Insecure Deserialization | Validación estricta de payloads JSON (tamaño, tipo, esquema) |
| Vulnerable Components | Auditoría periódica de dependencias (`npm audit`) |
| Logging & Monitoring insuficiente | Ver sección de monitoreo |
| CSRF | Backend basado en JWT (no cookies de sesión), por lo que el riesgo CSRF clásico se reduce; se valida `Origin`/CORS estricto |
| Rate limiting / fuerza bruta | Rate limiting por IP/usuario en endpoints de login y subida de evidencias |
| Subida de archivos | Validación de tipo MIME y tamaño antes de subir a Supabase Storage; escaneo opcional de malware en evidencias |

## CORS y exposición de servicios

- Backend con whitelist explícita de orígenes (dominio de la intranet web; mobile usa API key/JWT, no origen de navegador).
- Solo el backend expone puerto público (vía reverse proxy/HTTPS); Postgres y Supabase Storage no son accesibles directamente desde internet.

## Auditoría y trazabilidad

- Tabla de auditoría (`audit_log`) registrando: quién, qué acción (crear/editar acta, subir evidencia, firmar asistencia), cuándo, y sobre qué entidad. Esto es el núcleo de la solución al problema de trazabilidad de acuerdos y firmas.
- Las firmas (QR + reconocimiento facial) quedan con marca de tiempo y método, no son editables una vez registradas (solo insertables, nunca update/delete directo en `asistencia`).

## Monitoreo y logging

- Logs estructurados (JSON) del backend, sin datos sensibles (tokens, contraseñas) en texto plano.
- Centralización de logs (ej. stack ELK/Loki o servicio gestionado) para correlacionar errores entre backend y frontend.
- Alertas ante: fallos repetidos de login, caída del backend, errores 5xx sostenidos, fallas de match AI acta virtual/física.

## Backups y recuperación

- **Postgres:** backups automáticos diarios (`pg_dump` o snapshot de volumen) con retención mínima de 30 días, almacenados fuera del host de producción.
- **Supabase Storage:** versionado/retención de evidencias y actas físicas según política institucional de archivo documental.
- **Plan de recuperación:** RPO objetivo ≤ 24h, RTO objetivo ≤ 4h para restaurar backend + BD desde backup.

## CI/CD y entornos

- Entornos separados: `desarrollo`, `staging`, `producción`, cada uno con su propia instancia de Supabase y Postgres (sin compartir datos reales en dev/staging).
- Pipeline: lint + tests + build de imágenes Docker → despliegue a staging → aprobación manual → despliegue a producción.
- Variables de entorno y secretos gestionados fuera del repositorio (secret manager / variables de CI), nunca hardcodeados.

## Documentación relacionada

- [Backend](backend.md) — middlewares de autenticación/autorización y validación
- [Frontend](frontend.md) — manejo de sesión y permisos en UI
- [Mobile](mobile.md) — almacenamiento seguro de token y biometría
- [Base de datos](database.md) — RLS y modelo de auditoría
