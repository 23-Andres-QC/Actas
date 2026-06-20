# Frontend Web (Intranet)

## Tecnología

- **Framework:** React (Vite o Next.js)
- **Lenguaje:** TypeScript
- **Autenticación:** Supabase Auth (login, recuperación de contraseña)
- **Consumo de archivos:** Supabase Storage (evidencias, multimedia de reunión, acta física)
- **Contenedor:** Docker
- **Server state:** TanStack Query (cache, reintentos, invalidación tras mutaciones)
- **Client/UI state:** Zustand o Context API (sesión, rol activo, filtros de UI)
- **Formularios y validación:** React Hook Form + Zod (mismo esquema de validación que el backend, evita duplicar reglas)
- **Estilos:** Tailwind CSS o un design system propio basado en componentes

## Arquitectura: Feature-Based + Capa de API desacoplada

Misma filosofía de capas que el backend (sin lógica de negocio en componentes de UI): los componentes solo orquestan, la lógica de obtención/cache vive en hooks, y el acceso HTTP está aislado en una capa `api/`.

```
src/
├── app/                     # Bootstrap: router, providers (QueryClient, AuthProvider), layout raíz
├── features/                # Un folder por bounded context, igual que en el backend
│   ├── actas/
│   │   ├── api/             # actasApi.ts — únicos llamados a fetch/axios de este feature
│   │   ├── hooks/           # useActas, useActa, useCrearActa (TanStack Query)
│   │   ├── components/      # ActaCard, AcuerdoAccordion, SemaforoBadge
│   │   ├── pages/           # ActasDashboardPage, ActaDetallePage
│   │   └── types.ts         # Tipos compartidos del feature (espejo de los DTO del backend)
│   ├── acuerdos/
│   ├── asistencia/
│   ├── usuarios/
│   └── evidencias/
├── shared/
│   ├── ui/                  # Componentes genéricos (Button, Table, Modal, Avatar)
│   ├── auth/                # AuthContext, ProtectedRoute, hook useRol()
│   ├── api/                 # Cliente HTTP base (interceptor de JWT, manejo de errores 401/403)
│   └── utils/                # Formato de fechas, porcentaje de avance, etc.
└── tests/
```

### Principios aplicados

- **Una sola fuente de verdad para el rol activo:** `useRol()` centraliza qué puede ver/hacer el usuario; los componentes consultan este hook en vez de repetir lógica de permisos (espejo del RBAC del backend, ver [infraestructura.md](infraestructura.md)).
- **Rutas protegidas por rol:** `ProtectedRoute` valida sesión (JWT vigente) y rol antes de renderizar; si el backend rechaza con 403, la UI muestra estado de error consistente, nunca asume permisos en el cliente como única defensa.
- **Capa de API aislada:** ningún componente llama `fetch`/`axios` directamente; todo pasa por `features/*/api` + cliente base en `shared/api`, que adjunta el JWT y normaliza errores.
- **Invalidación de cache tras mutaciones:** subir evidencia, registrar avance, etc. invalidan las queries relacionadas (ej. `useActa(id)`) para reflejar el semáforo/% de avance sin recarga manual.
- **Accesibilidad y manejo de errores:** estados de carga/error/vacío explícitos en cada pantalla (no solo "loading spinner"); componentes de formulario anuncian errores de validación con `aria-*`.
- **Sanitización de salida:** el contenido de actas generado con AI se renderiza como texto/markdown sanitizado (nunca `dangerouslySetInnerHTML` sin pasar por un sanitizador), evitando XSS (ver [infraestructura.md](infraestructura.md)).

### Testing

| Tipo | Qué cubre | Herramienta sugerida |
|---|---|---|
| Unitarios | Hooks, utils, lógica de semáforo/avance en el cliente | Vitest/Jest + Testing Library |
| Componentes | Render condicional por rol, formularios, estados de error | React Testing Library |
| E2E | Flujos completos (login → crear acta → subir evidencia) | Playwright/Cypress |

## Resumen de pantallas

| Pantalla | Descripción | Rol |
|---|---|---|
| Login / Recuperar contraseña | Autenticación vía Supabase | Todos |
| Dashboard de actas | Listado de actas (todas, por área o creadas por el usuario según rol) | Todos |
| Crear acta | Formato estándar o generación/ajuste con AI | Convocador |
| Detalle de acta | Desplegable con todos los acuerdos del acta, responsable principal de cada uno | Todos los roles autorizados |
| Detalle de acuerdo | Fecha inicio, fecha fin, semáforo de cumplimiento, evidencias presentadas (subir/ver) | Responsable, Admin, SuperAdmin |
| Avance de acta | % de avance general del acta y por cada acuerdo | Todos los roles autorizados |
| Acta virtual vs física | Ver acta virtual, subir acta física, match con AI para calcular inasistentes | Convocador, Admin |
| Inasistentes | Ver inasistentes por área, subir evidencia de no asistencia | Admin |
| Evidencias de reunión | Subir URL de grabación virtual, subir fotos/videos de la reunión | Convocador |
| Gestión de usuarios | Asignar Admins a usuarios | SuperAdmin |
| Gestión de convocadores | Asignar convocadores de reunión | Admin |

## Flujo por rol

- **SuperAdmin:** Dashboard global de actas → asignación de Admins.
- **Admin:** Dashboard de actas de su área → asignación de convocadores → revisión de inasistentes.
- **Convocador:** Creación de actas y acuerdos → carga de acta física y evidencias de reunión → seguimiento de avance.
- **Asistente:** Acceso de solo lectura a sus acuerdos asignados (vista web limitada; el registro de asistencia y firma se realiza en mobile).
