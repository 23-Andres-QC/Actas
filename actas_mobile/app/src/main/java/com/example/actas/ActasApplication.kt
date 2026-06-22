package com.example.actas

import android.app.Application
import android.graphics.Bitmap
import com.example.actas.data.local.FirmaCache
import com.example.actas.data.remote.BackendApi
import com.example.actas.data.remote.FaceServiceApi
import com.example.actas.data.remote.RetrofitClient
import com.example.actas.data.session.SessionManager
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetector
import com.google.mlkit.vision.face.FaceDetectorOptions

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

    /**
     * Compartido entre FaceEnrollmentScreen y FaceVerificationScreen: con CLASSIFICATION_MODE_ALL,
     * ML Kit carga su modelo de clasificación de forma perezosa en el primer process(), lo que
     * se sentía como un cuelgue al entrar a esas pantallas. Al crear el cliente una sola vez aquí
     * y precalentarlo en onCreate, ese costo ya pasó mucho antes de que el usuario llegue a la cámara.
     */
    lateinit var faceDetector: FaceDetector
        private set

    override fun onCreate() {
        super.onCreate()
        sessionManager = SessionManager(this)
        backendApi = RetrofitClient.backendApi(sessionManager)
        faceServiceApi = RetrofitClient.faceServiceApi(sessionManager)
        firmaCache = FirmaCache(this)

        faceDetector = FaceDetection.getClient(
            FaceDetectorOptions.Builder()
                .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                .build(),
        )
        precalentarFaceDetector()
    }

    private fun precalentarFaceDetector() {
        val bitmapVacio = Bitmap.createBitmap(32, 32, Bitmap.Config.ARGB_8888)
        faceDetector.process(InputImage.fromBitmap(bitmapVacio, 0))
            .addOnCompleteListener { bitmapVacio.recycle() }
    }
}
