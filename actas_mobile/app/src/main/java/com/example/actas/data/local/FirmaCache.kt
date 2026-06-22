package com.example.actas.data.local

import android.content.Context
import java.io.File

/**
 * Copia local de la firma guardada por el usuario, para no depender de red
 * cada vez que firma con biometría. No es información sensible distinta de
 * cualquier imagen, por eso vive sin cifrar a diferencia de SessionManager.
 */
class FirmaCache(context: Context) {

    private val archivo = File(context.filesDir, "firma_guardada.png")

    fun guardar(bytes: ByteArray) {
        archivo.writeBytes(bytes)
    }

    fun leer(): ByteArray? = if (archivo.exists()) archivo.readBytes() else null

    fun existe(): Boolean = archivo.exists()
}
