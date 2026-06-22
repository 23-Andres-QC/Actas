package com.example.actas.data.session

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * El JWT nunca se guarda en SharedPreferences plano (ver docs/infraestructura.md):
 * se cifra con una clave maestra administrada por el Android Keystore.
 */
class SessionManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "actas_session",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun guardarSesion(accessToken: String, refreshToken: String, userId: String, email: String, rol: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putString(KEY_USER_ID, userId)
            .putString(KEY_EMAIL, email)
            .putString(KEY_ROL, rol)
            .apply()
    }

    fun accessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)
    fun userId(): String? = prefs.getString(KEY_USER_ID, null)
    fun email(): String? = prefs.getString(KEY_EMAIL, null)
    fun rol(): String? = prefs.getString(KEY_ROL, null)

    fun haySesionActiva(): Boolean = accessToken() != null

    fun biometriaConfigurada(): Boolean = prefs.getBoolean(KEY_BIOMETRIA_CONFIGURADA, false)

    fun marcarBiometriaConfigurada() {
        prefs.edit().putBoolean(KEY_BIOMETRIA_CONFIGURADA, true).apply()
    }

    fun cerrarSesion() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_EMAIL = "email"
        private const val KEY_ROL = "rol"
        private const val KEY_BIOMETRIA_CONFIGURADA = "biometria_configurada"
    }
}
