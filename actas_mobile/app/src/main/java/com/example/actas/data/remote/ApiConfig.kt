package com.example.actas.data.remote

/**
 * Mismas credenciales públicas (anon key) que usa actas_fronted/.env — nunca la secret key.
 *
 * BACKEND_URL usa 10.0.2.2, que es como el emulador de Android ve el "localhost" de tu PC.
 * Si pruebas en un dispositivo físico en la misma red, cámbialo por la IP LAN de tu equipo
 * (ej. "http://192.168.1.50:4000/api/v1/") y agrega esa IP a network_security_config.xml.
 */
object ApiConfig {
    const val SUPABASE_URL = "https://ksxwqeljoqfsdrfbksvo.supabase.co"
    const val SUPABASE_ANON_KEY = "sb_publishable_to4uIa_BwOUbKuJxiqJW1w_z5QCRTkM"

    /**
     * "localhost" aquí es el localhost DEL EMULADOR, no el de tu PC. Para que apunte
     * al backend real corriendo en tu máquina, hace falta túnel: `adb reverse
     * tcp:4000 tcp:4000` (ver actas_mobile/README o pídele a Claude que lo configure).
     * Usamos esto en vez de 10.0.2.2 porque en este entorno la ruta NAT del emulador
     * hacia Docker (vía WSL2/Hyper-V) se queda colgada sin responder.
     */
    const val BACKEND_URL = "http://localhost:4000/api/v1/"
}
