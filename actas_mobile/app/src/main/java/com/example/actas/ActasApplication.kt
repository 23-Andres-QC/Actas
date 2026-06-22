package com.example.actas

import android.app.Application
import com.example.actas.data.local.FirmaCache
import com.example.actas.data.remote.BackendApi
import com.example.actas.data.remote.FaceServiceApi
import com.example.actas.data.remote.RetrofitClient
import com.example.actas.data.session.SessionManager

/**
 * Contenedor manual de dependencias (sin Hilt), mismo criterio pragmático
 * que el backend: instanciación directa en un único punto, sin framework de DI.
 */
class ActasApplication : Application() {

    lateinit var sessionManager: SessionManager
        private set

    lateinit var backendApi: BackendApi
        private set

    lateinit var faceServiceApi: FaceServiceApi
        private set

    lateinit var firmaCache: FirmaCache
        private set

    override fun onCreate() {
        super.onCreate()
        sessionManager = SessionManager(this)
        backendApi = RetrofitClient.backendApi(sessionManager)
        faceServiceApi = RetrofitClient.faceServiceApi(sessionManager)
        firmaCache = FirmaCache(this)
    }
}
