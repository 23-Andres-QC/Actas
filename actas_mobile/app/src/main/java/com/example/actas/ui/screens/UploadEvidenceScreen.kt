package com.example.actas.ui.screens

import android.net.Uri
import android.webkit.MimeTypeMap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.actas.ActasApplication
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException

private data class ErrorBody(val error: ErrorDetail?)
private data class ErrorDetail(val message: String?)

private fun mensajeDeError(e: Exception): String {
    if (e is HttpException) {
        val cuerpo = e.response()?.errorBody()?.string()
        val mensaje = cuerpo?.let { runCatching { Gson().fromJson(it, ErrorBody::class.java).error?.message }.getOrNull() }
        if (!mensaje.isNullOrBlank()) return mensaje
    }
    return "No se pudo subir la evidencia. Intenta de nuevo."
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadEvidenceScreen(
    agreementId: String,
    onEvidenceUploaded: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val scope = rememberCoroutineScope()

    var selectedUri by remember { mutableStateOf<Uri?>(null) }
    var subiendo by remember { mutableStateOf(false) }
    var subido by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> selectedUri = uri; error = null }

    fun subir() {
        val uri = selectedUri ?: return
        error = null
        subiendo = true
        scope.launch {
            try {
                val (bytes, mimeType, nombre) = withContext(Dispatchers.IO) {
                    val resolver = context.contentResolver
                    val tipo = resolver.getType(uri) ?: "application/octet-stream"
                    val extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(tipo) ?: "dat"
                    val datos = resolver.openInputStream(uri)?.use { it.readBytes() } ?: throw IllegalStateException("No se pudo leer el archivo")
                    Triple(datos, tipo, "evidencia_$agreementId.$extension")
                }

                val part = MultipartBody.Part.createFormData("archivo", nombre, bytes.toRequestBody(mimeType.toMediaTypeOrNull()))
                app.backendApi.subirEvidencia(agreementId, part)

                subiendo = false
                subido = true
            } catch (e: Exception) {
                subiendo = false
                error = mensajeDeError(e)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Subir evidencia") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver") } },
            )
        },
    ) { paddingValues ->
        Column(
            modifier = Modifier.fillMaxSize().padding(paddingValues).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            if (subido) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(72.dp), tint = Color(0xFF16A34A))
                Spacer(Modifier.height(16.dp))
                Text("Evidencia subida correctamente", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
                Spacer(Modifier.height(24.dp))
                Button(onClick = onEvidenceUploaded, modifier = Modifier.fillMaxWidth().height(50.dp)) { Text("Listo") }
                return@Column
            }

            Text("Adjunta un documento, foto o video como evidencia de cumplimiento", style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
            Spacer(Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(2.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                    .padding(32.dp),
                contentAlignment = Alignment.Center,
            ) {
                if (selectedUri != null) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(40.dp))
                        Spacer(Modifier.height(8.dp))
                        Text("Archivo seleccionado", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Medium)
                        Spacer(Modifier.height(8.dp))
                        TextButton(onClick = { launcher.launch("*/*") }) { Text("Cambiar archivo") }
                    }
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(12.dp))
                        OutlinedButton(onClick = { launcher.launch("*/*") }) { Text("Seleccionar archivo") }
                    }
                }
            }

            if (error != null) {
                Spacer(Modifier.height(12.dp))
                Text(error!!, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = { subir() },
                enabled = selectedUri != null && !subiendo,
                modifier = Modifier.fillMaxWidth().height(50.dp),
            ) {
                if (subiendo) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Subir y guardar")
                }
            }
        }
    }
}
