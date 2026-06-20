# Backend

## Tecnología

- **Framework:** ExpressJS (Node.js)
- **Lenguaje:** TypeScript / JavaScript
- **Base de datos:** PostgreSQL
- **Autenticación:** Supabase Auth (JWT, recuperación de contraseña)
- **Almacenamiento de archivos:** Supabase Storage (evidencias, fotos/videos de reunión, actas físicas)
- **Contenedor:** Docker

## Arquitectura: Domain-Driven Design (DDD) + Arquitectura Hexagonal (Ports & Adapters)

Cada bounded context (`acta`, `acuerdo`, `asistencia`, `usuario`, `evidencia`) se organiza en 4 capas con dependencia en una sola dirección (`interfaces → application → domain ← infrastructure`). El dominio nunca importa de `infrastructure` ni de `interfaces`; solo expone **puertos** (interfaces) que `infrastructure` implementa como **adaptadores**.

```
src/
├── modules/
│   ├── acta/
│   │   ├── domain/
│   │   │   ├── acta.entity.ts          # Entidad rica: invariantes, reglas (% avance, semáforo)
│   │   │   ├── acta.repository.ts      # Puerto (interfaz) — sin implementación
│   │   │   ├── acta.events.ts          # Eventos de dominio: ActaCreada, AcuerdoVencido
│   │   │   └── value-objects/          # PorcentajeAvance, Semaforo, FechaVigencia
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── crear-acta.use-case.ts
│   │   │   │   ├── calcular-avance.use-case.ts
│   │   │   │   └── match-asistencia-ai.use-case.ts
│   │   │   └── dto/                    # CrearActaDTO, ActaResponseDTO (entrada/salida, no exponen entidades)
│   │   ├── infrastructure/
│   │   │   ├── postgres-acta.repository.ts   # Adaptador del puerto acta.repository.ts
│   │   │   └── ai-match.adapter.ts           # Adaptador del servicio de IA
│   │   └── interfaces/
│   │       └── http/
│   │           ├── acta.controller.ts
│   │           ├── acta.routes.ts
│   │           └── acta.validators.ts  # Esquemas Zod por endpoint
│   ├── acuerdo/  (misma estructura)
│   ├── asistencia/
│   ├── usuario/
│   └── evidencia/
├── shared/
│   ├── kernel/             # Tipos base: Entity, AggregateRoot, ValueObject, DomainEvent, Result<T, E>
│   ├── errors/             # Jerarquía de errores de dominio (NotFoundError, ForbiddenError, ValidationError)
│   ├── events/             # Event bus interno (despacha eventos de dominio a handlers)
│   └── logger/             # Logger estructurado (pino/winston) inyectado por DI
├── infrastructure/
│   ├── db/                 # Conexión Postgres, migraciones (knex/drizzle/prisma), unit of work
│   ├── supabase/            # Clientes Auth y Storage compartidos
│   ├── container.ts        # Contenedor de inyección de dependencias (tsyringe/awilix)
│   └── http/
│       ├── middlewares/    # auth.middleware, rbac.middleware, error-handler, rate-limit, helmet, cors
│       └── server.ts       # Bootstrap de Express, registro de rutas por módulo
└── main.ts                 # Punto de entrada, carga de config y arranque
```

### Principios aplicados

- **Separación estricta de capas:** `domain` no conoce Express, Postgres ni Supabase. Esto permite testear reglas de negocio sin BD ni HTTP.
- **Repository pattern:** cada agregado define un puerto (`ActaRepository`) en `domain`; la implementación Postgres vive en `infrastructure` y se inyecta vía DI — permite swap de motor de BD sin tocar casos de uso.
- **DTOs explícitos:** los controladores nunca devuelven entidades de dominio directamente; siempre mapean a DTOs de respuesta (evita fugas de campos internos y desacopla el contrato HTTP del modelo de dominio).
- **Manejo de errores centralizado:** los casos de uso lanzan errores de dominio tipados (`shared/errors`); un middleware `error-handler` los traduce a códigos HTTP (404, 403, 422, 500) con formato de respuesta consistente (`{ error: { code, message } }`).
- **Inyección de dependencias:** un contenedor (`infrastructure/container.ts`) resuelve repositorios, clientes externos (Supabase, IA) y los inyecta en los casos de uso — facilita mocking en tests.
- **Eventos de dominio:** acciones como `ActaCreada`, `AcuerdoVencido`, `EvidenciaSubida` se publican a un event bus interno; permite agregar side-effects (notificaciones, auditoría) sin acoplar el caso de uso principal.
- **Validación en el borde:** esquemas Zod en `interfaces/http/*.validators.ts` validan el request antes de llegar al caso de uso (rechazan payloads inválidos con 422 antes de tocar el dominio).
- **Result/Either pattern:** los casos de uso retornan `Result<T, DomainError>` en vez de lanzar excepciones para errores de negocio esperados (ej. "acuerdo ya cerrado"), reservando `throw` para errores inesperados.
- **Auditoría transversal:** un middleware/listener de eventos persiste cada acción relevante en `audit_log` (ver [database.md](database.md)) sin que cada caso de uso tenga que implementarlo manualmente.

### Testing

| Tipo | Qué cubre | Herramienta sugerida |
|---|---|---|
| Unitarios | Entidades, value objects, casos de uso (con repositorios mockeados) | Jest/Vitest |
| Integración | Adaptadores Postgres/Supabase contra BD de test (Docker) | Jest + Testcontainers |
| Contrato/E2E | Endpoints HTTP completos (auth + RBAC + casos felices/error) | Supertest |
| Estáticos | Tipado, lint, validación de esquemas | TypeScript strict, ESLint |

### Observabilidad y calidad

- **Logging estructurado** (JSON) con correlación por `request_id`, inyectado vía DI en cada caso de uso.
- **Healthcheck** (`GET /health`) y **readiness** (`GET /ready`) para orquestación en Docker/Kubernetes.
- **Documentación de API:** OpenAPI/Swagger generado desde los validators Zod (ej. `zod-to-openapi`), servido en `/api/docs`.
- **Versionado de API:** prefijo `/api/v1/...` para permitir evolución sin romper clientes (web/mobile) existentes.
- Ver contramedidas de seguridad transversales (RBAC, RLS, OWASP, rate limiting) en [infraestructura.md](infraestructura.md).

## Resumen de APIs

### Autenticación
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión (Supabase Auth) | Todos |
| POST | `/api/auth/recover` | Recuperar contraseña | Todos |
| POST | `/api/auth/register` | Registrar nuevo usuario | SuperAdmin/Admin |

### Usuarios y roles
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuarios | SuperAdmin/Admin |
| PATCH | `/api/usuarios/:id/rol` | Asignar rol (admin/convocador) | SuperAdmin/Admin |
| GET | `/api/usuarios/:id/areas` | Áreas asignadas al usuario | SuperAdmin/Admin |

### Actas
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/actas` | Crear acta (formato estándar o con AI) | Convocador |
| GET | `/api/actas` | Listar actas (filtrable por área) | SuperAdmin/Admin/Convocador |
| GET | `/api/actas/:id` | Detalle de acta + acuerdos + % avance | Todos los roles autorizados |
| GET | `/api/actas/:id/avance` | Porcentaje de avance general | Todos los roles autorizados |
| POST | `/api/actas/:id/acta-fisica` | Subir acta física firmada | Convocador |
| GET | `/api/actas/:id/match-asistencia` | Match AI acta virtual vs física (inasistentes) | Admin/Convocador |

### Acuerdos
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/actas/:id/acuerdos` | Crear acuerdo (responsable, fecha inicio/fin) | Convocador |
| GET | `/api/acuerdos/:id` | Detalle de acuerdo (semáforo, evidencias) | Responsable/Admin/SuperAdmin |
| PATCH | `/api/acuerdos/:id` | Actualizar estado/fechas | Convocador/Admin |
| POST | `/api/acuerdos/:id/evidencias` | Subir evidencia de cumplimiento | Responsable |
| GET | `/api/acuerdos/:id/evidencias` | Ver evidencias subidas | Responsable/Admin/SuperAdmin |

### Asistencia
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/actas/:id/asistencia/qr` | Registrar asistencia vía QR | Asistente |
| POST | `/api/actas/:id/asistencia/firma` | Firma con reconocimiento facial | Asistente |
| GET | `/api/actas/:id/inasistentes` | Listar inasistentes | Admin |
| POST | `/api/actas/:id/inasistentes/:usuarioId/evidencia` | Subir evidencia de inasistencia | Admin |

### Evidencias de reunión
| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| POST | `/api/actas/:id/grabacion` | Registrar URL de grabación virtual | Convocador |
| POST | `/api/actas/:id/multimedia` | Subir fotos/videos de la reunión | Convocador |
