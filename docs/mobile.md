# Mobile

## Tecnología

- **Lenguaje:** Kotlin
- **IDE:** Android Studio "Pandas" 3 (2022.3)
- **UI:** Jetpack Compose
- **Autenticación:** Supabase Auth (Kotlin client / REST + DataStore para persistir el JWT cifrado)
- **Almacenamiento de archivos:** Supabase Storage (evidencias de acuerdos)
- **Reconocimiento facial:** SDK de detección/reconocimiento facial (ej. ML Kit Face Detection) para firma virtual
- **Escaneo QR:** ML Kit Barcode Scanning o ZXing
- **Inyección de dependencias:** Hilt
- **Networking:** Retrofit + OkHttp (interceptor de Authorization)
- **Persistencia local:** Room (cache offline del calendario de acuerdos)

## Arquitectura: Clean Architecture + MVVM (mismas capas que backend/frontend)

```
app/src/main/java/.../
├── domain/                  # Pure Kotlin, sin dependencias de Android
│   ├── model/               # Acta, Acuerdo, Asistencia (data classes de dominio)
│   ├── repository/          # Interfaces (puertos): ActaRepository, AsistenciaRepository
│   └── usecase/             # RegistrarAsistenciaQrUseCase, FirmarConFacialUseCase, SubirEvidenciaUseCase
├── data/
│   ├── remote/
│   │   ├── api/             # Interfaces Retrofit (ActaApi, AcuerdoApi) — consumen el mismo backend Express
│   │   └── dto/             # DTOs de red + mappers a modelos de dominio
│   ├── local/                # Room: entidades y DAO para cache offline del calendario
│   └── repository/          # Implementación de los puertos (Retrofit + Room + Supabase SDK)
├── di/                       # Módulos Hilt (NetworkModule, RepositoryModule, SupabaseModule)
├── ui/
│   ├── theme/
│   ├── navigation/           # NavHost, rutas por rol
│   └── feature/
│       ├── login/            # Screen + ViewModel
│       ├── qrscanner/
│       ├── firmafacial/
│       ├── calendario/
│       └── acuerdodetalle/
└── core/
    ├── session/               # Manejo seguro del JWT (EncryptedSharedPreferences/DataStore)
    └── error/                  # Mapeo de errores HTTP a estados de UI
```

### Principios aplicados

- **MVVM con estado unidireccional:** cada pantalla tiene un `ViewModel` que expone un `StateFlow<UiState>`; la `Screen` (Compose) solo observa y dispara eventos, sin lógica de negocio embebida.
- **Domain puro y testeable:** los casos de uso (`usecase/`) no conocen Retrofit ni Compose, reciben repositorios por interfaz (inyectados con Hilt) — se pueden testear con repositorios fake, igual que los use-cases del backend.
- **Mismo contrato que el backend:** los DTOs en `data/remote/dto` reflejan los DTOs documentados en [backend.md](backend.md); cualquier cambio de contrato se sincroniza entre ambos.
- **Sesión segura:** el JWT de Supabase nunca se guarda en `SharedPreferences` plano; se usa `EncryptedSharedPreferences` o `DataStore` con cifrado (ver [infraestructura.md](infraestructura.md)).
- **Datos biométricos:** el frame facial capturado se procesa en memoria para la verificación y se descarta inmediatamente; no se persiste en disco salvo que se requiera como evidencia, en cuyo caso se sube cifrado a Supabase Storage.
- **Offline-first parcial:** el calendario de seguimiento se cachea en Room para consulta sin conexión; las mutaciones (subir evidencia, firmar) requieren conexión y se reintenta vía `WorkManager` si falla.
- **Manejo de errores consistente:** un mapeador central traduce errores HTTP (401/403/422/500) a estados de UI reutilizables en todas las pantallas, igual que el `error-handler` del backend.

### Testing

| Tipo | Qué cubre | Herramienta sugerida |
|---|---|---|
| Unitarios | Casos de uso, ViewModels (con repositorios fake) | JUnit + Turbine (Flow testing) |
| Instrumentados | Room DAO, navegación, permisos de cámara | AndroidX Test + Espresso |
| UI | Pantallas Compose críticas (login, escáner QR, firma facial) | Compose UI Test |

## Resumen de pantallas

| Pantalla | Descripción | Rol |
|---|---|---|
| Login / Recuperar contraseña | Autenticación vía Supabase | Todos |
| Escáner QR | Lectura de QR del acta para registrar asistencia a la reunión | Asistente |
| Firma virtual | Captura de reconocimiento facial para validar/firmar asistencia | Asistente |
| Calendario de seguimiento | Calendario personal por usuario con sus acuerdos, fecha de inicio y fecha fin | Todos los roles autorizados |
| Detalle de acuerdo | Estado del acuerdo, semáforo, carga de evidencia de cumplimiento | Responsable |
| Mis actas | Listado de actas donde el usuario participa o es responsable de acuerdos | Todos los roles autorizados |

## Flujo principal (Asistente)

1. Escanea el QR mostrado en la reunión → registra asistencia.
2. Firma con reconocimiento facial → valida identidad.
3. Revisa su calendario de seguimiento → ve acuerdos asignados con fechas.
4. Sube evidencia de cumplimiento desde el detalle del acuerdo.

## Notas de infraestructura

- App nativa Android (Kotlin), sin backend propio: consume las mismas APIs Express que el frontend web.
- Carga de evidencias/fotos vía Supabase Storage directamente o a través del backend, según política de seguridad definida.
