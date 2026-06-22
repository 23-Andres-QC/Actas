package com.example.actas.data.remote

object ApiConfig {
    /**
     * "localhost" aquí es el localhost DEL EMULADOR, no el de tu PC. Para que apunte
     * al backend real corriendo en tu máquina, hace falta túnel: `adb reverse
     * tcp:4000 tcp:4000` (ver actas_mobile/README o pídele a Claude que lo configure).
     * Usamos esto en vez de 10.0.2.2 porque en este entorno la ruta NAT del emulador
     * hacia Docker (vía WSL2/Hyper-V) se queda colgada sin responder.
     */
    const val BACKEND_URL = "http://localhost:4000/api/v1/"

    /** Microservicio aparte de reconocimiento facial (actas_face_service). Mismo túnel: `adb reverse tcp:4100 tcp:4100`. */
    const val FACE_SERVICE_URL = "http://localhost:4100/"
}
