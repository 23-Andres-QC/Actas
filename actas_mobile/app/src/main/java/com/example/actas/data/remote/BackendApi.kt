package com.example.actas.data.remote

import com.example.actas.data.remote.dto.AcuerdoDto
import com.example.actas.data.remote.dto.AsistenciaResponse
import com.example.actas.data.remote.dto.EvidenciaResponse
import okhttp3.MultipartBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface BackendApi {
    @GET("acuerdos/mios")
    suspend fun misAcuerdos(): List<AcuerdoDto>

    @Multipart
    @POST("actas/{actaId}/asistencia")
    suspend fun registrarAsistencia(
        @Path("actaId") actaId: String,
        @Part("metodo") metodo: MultipartBody.Part,
        @Part firma: MultipartBody.Part?,
    ): AsistenciaResponse

    @Multipart
    @POST("acuerdos/{acuerdoId}/evidencias")
    suspend fun subirEvidencia(
        @Path("acuerdoId") acuerdoId: String,
        @Part archivo: MultipartBody.Part,
    ): EvidenciaResponse
}
