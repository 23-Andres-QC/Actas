package com.example.actas.data.remote

import retrofit2.HttpException
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/**
 * Traduce excepciones de red a mensajes que de verdad ayudan a diagnosticar
 * (antes todo caía en "verifica tu conexión", ocultando si era el backend
 * caído, el emulador sin red, o un error real del servidor).
 */
fun mensajeDeErrorRed(e: Exception): String = when (e) {
    is UnknownHostException -> "No se pudo resolver ${ApiConfig.BACKEND_URL}. ¿Está bien escrita la URL del backend?"
    is ConnectException -> "No se pudo conectar a ${ApiConfig.BACKEND_URL}. ¿Está corriendo el backend (docker compose up)?"
    is SocketTimeoutException -> "El servidor no respondió a tiempo. Revisa tu conexión."
    is HttpException -> "El servidor respondió con un error (${e.code()})."
    is IOException -> "Error de red: ${e.message ?: "sin conexión"}."
    else -> "Error inesperado: ${e.message ?: e::class.simpleName}"
}
