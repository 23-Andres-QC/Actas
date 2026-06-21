package com.example.actas.data.remote

import com.example.actas.data.remote.dto.SupabaseLoginRequest
import com.example.actas.data.remote.dto.SupabaseLoginResponse
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query

interface SupabaseAuthApi {
    @POST("auth/v1/token")
    suspend fun login(
        @Query("grant_type") grantType: String = "password",
        @Header("apikey") apiKey: String = ApiConfig.SUPABASE_ANON_KEY,
        @Body body: SupabaseLoginRequest,
    ): SupabaseLoginResponse
}
