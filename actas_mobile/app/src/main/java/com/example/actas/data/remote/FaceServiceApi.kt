package com.example.actas.data.remote

import com.example.actas.data.remote.dto.EnrolarRostroResponse
import com.example.actas.data.remote.dto.EstadoRostroResponse
import com.example.actas.data.remote.dto.VerificarRostroResponse
import okhttp3.MultipartBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

/** Cliente del microservicio actas_face_service (puerto/dominio aparte de BACKEND_URL). */
interface FaceServiceApi {
    @Multipart
    @POST("enrolar")
    suspend fun enrolar(@Part rostro: MultipartBody.Part): EnrolarRostroResponse

    @Multipart
    @POST("verificar")
    suspend fun verificar(@Part rostro: MultipartBody.Part): VerificarRostroResponse

    @GET("estado")
    suspend fun estado(): EstadoRostroResponse
}
