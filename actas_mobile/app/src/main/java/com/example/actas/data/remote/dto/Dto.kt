package com.example.actas.data.remote.dto

// --- Backend: autenticación ---
// El login se hace contra NUESTRO backend (tabla usuario, JWT propio), no contra Supabase Auth:
// Supabase Auth es un store de usuarios totalmente separado de la tabla `usuario` de Postgres,
// y el authMiddleware del backend solo acepta JWT firmados con JWT_SECRET (no tokens de Supabase).

data class BackendLoginRequest(val email: String, val password: String)

data class BackendLoginResponse(val token: String, val usuario: BackendUsuarioDto)

data class BackendUsuarioDto(
    val id: String,
    val nombre: String,
    val email: String,
    val rol: String,
    val areaId: String?,
    val cargo: String?,
)

// --- Backend: mis acuerdos ---

data class AcuerdoDto(
    val id: String,
    val actaId: String,
    val responsableId: String,
    val descripcion: String,
    val fechaInicio: String,
    val fechaFin: String,
    val estadoSemaforo: String,
    val porcentajeAvance: Double,
    val actaTitulo: String,
)

// --- Backend: actas visibles para el área del usuario ---

data class ActaDto(
    val id: String,
    val titulo: String,
    val fecha: String,
    val lugar: String,
    val urlReunion: String?,
    val urlActaFisica: String?,
    val firmado: Boolean,
)

// --- Backend: asistencia ---

data class AsistenciaResponse(val ok: Boolean, val firmaUrl: String?)

// --- Backend: firma reutilizable del usuario ---

data class FirmaResponse(val firmaUrl: String?)

// --- actas_face_service: reconocimiento facial (microservicio aparte) ---

data class EnrolarRostroResponse(val enrolado: Boolean)

data class VerificarRostroResponse(val coincide: Boolean, val similitud: Double)

data class EstadoRostroResponse(val enrolado: Boolean)

// --- Backend: evidencia ---

data class EvidenciaResponse(val ok: Boolean)
