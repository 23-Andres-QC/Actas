package com.example.actas.data.remote.dto

import com.google.gson.annotations.SerializedName

// --- Supabase Auth ---

data class SupabaseLoginRequest(val email: String, val password: String)

data class SupabaseLoginResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String,
    val user: SupabaseUser,
)

data class SupabaseUser(
    val id: String,
    val email: String,
    @SerializedName("app_metadata") val appMetadata: SupabaseAppMetadata,
)

data class SupabaseAppMetadata(val rol: String?)

data class SupabaseErrorResponse(
    @SerializedName("error_description") val errorDescription: String?,
    val msg: String?,
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

// --- Backend: asistencia ---

data class AsistenciaResponse(val ok: Boolean, val firmaUrl: String?)

// --- Backend: evidencia ---

data class EvidenciaResponse(val ok: Boolean)
