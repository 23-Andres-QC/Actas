package com.example.actas.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Rect
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.mlkit.vision.MlKitAnalyzer
import androidx.camera.view.CameraController
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Face
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.actas.ActasApplication
import com.example.actas.data.remote.mensajeDeErrorRed
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.util.concurrent.Executors

private const val FRAMES_REQUERIDOS = 5

/**
 * Reemplaza al BiometricPrompt nativo: verifica identidad comparando un embedding facial
 * extraído en el momento contra el guardado en actas_face_service (no en este dispositivo).
 *
 * Si ya hay una firma guardada (FirmaCache), tras verificar se registra la asistencia
 * automáticamente con esa firma, sin pasar por SignatureScreen.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaceVerificationScreen(
    actaId: String,
    qrToken: String,
    onAsistenciaRegistrada: () -> Unit,
    onNecesitaFirmar: (metodo: String) -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()

    var hasCameraPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    var framesConRostro by remember { mutableIntStateOf(0) }
    var rostroListo by remember { mutableStateOf(false) }
    var mensaje by remember { mutableStateOf("Ubica tu rostro dentro del óvalo") }
    var procesando by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var sinEnrolar by remember { mutableStateOf(false) }
    val cameraController = remember { LifecycleCameraController(context) }
    val analysisExecutor = remember { Executors.newSingleThreadExecutor() }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted },
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    DisposableEffect(Unit) {
        onDispose {
            cameraController.clearImageAnalysisAnalyzer()
            cameraController.unbind()
            analysisExecutor.shutdown()
        }
    }

    fun enviarAsistenciaConFirmaGuardada(bytes: ByteArray) {
        scope.launch {
            try {
                val firmaPart = MultipartBody.Part.createFormData("firma", "firma.png", bytes.toRequestBody("image/png".toMediaTypeOrNull()))
                val metodoPart = MultipartBody.Part.createFormData("metodo", "", "biometrico".toRequestBody("text/plain".toMediaTypeOrNull()))
                val qrTokenPart = MultipartBody.Part.createFormData("qrToken", "", qrToken.toRequestBody("text/plain".toMediaTypeOrNull()))
                app.backendApi.registrarAsistencia(actaId, metodoPart, firmaPart, qrTokenPart)
                onAsistenciaRegistrada()
            } catch (e: Exception) {
                procesando = false
                framesConRostro = 0
                rostroListo = false
                error = mensajeDeErrorRed(e)
            }
        }
    }

    fun verificarRostro(bytes: ByteArray) {
        scope.launch {
            try {
                val rostroPart = MultipartBody.Part.createFormData("rostro", "rostro.jpg", bytes.toRequestBody("image/jpeg".toMediaTypeOrNull()))
                val resultado = app.faceServiceApi.verificar(rostroPart)
                if (!resultado.coincide) {
                    procesando = false
                    framesConRostro = 0
                    rostroListo = false
                    error = "No pudimos confirmar que eres tú. Intenta de nuevo con mejor luz."
                    return@launch
                }
                val firmaCacheada = app.firmaCache.leer()
                if (firmaCacheada != null) {
                    enviarAsistenciaConFirmaGuardada(firmaCacheada)
                } else {
                    onNecesitaFirmar("biometrico")
                }
            } catch (e: HttpException) {
                procesando = false
                framesConRostro = 0
                rostroListo = false
                if (e.code() == 404) {
                    sinEnrolar = true
                } else {
                    error = mensajeDeErrorRed(e)
                }
            } catch (e: Exception) {
                procesando = false
                framesConRostro = 0
                rostroListo = false
                error = mensajeDeErrorRed(e)
            }
        }
    }

    fun capturar() {
        if (procesando || !rostroListo) return
        procesando = true
        error = null
        mensaje = "Verificando..."
        cameraController.takePicture(
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageCapturedCallback() {
                override fun onCaptureSuccess(image: ImageProxy) {
                    val buffer = image.planes[0].buffer
                    val bytes = ByteArray(buffer.remaining())
                    buffer.get(bytes)
                    image.close()
                    verificarRostro(bytes)
                }

                override fun onError(exception: ImageCaptureException) {
                    procesando = false
                    framesConRostro = 0
                    rostroListo = false
                    error = "No se pudo capturar la foto: ${exception.message}"
                }
            },
        )
    }

    LaunchedEffect(rostroListo, procesando) {
        if (rostroListo && !procesando) {
            delay(350)
            if (rostroListo && !procesando) capturar()
        }
    }

    val progreso = (framesConRostro.toFloat() / FRAMES_REQUERIDOS).coerceIn(0f, 1f)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Verificación facial") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver") } },
            )
        },
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
            if (sinEnrolar) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.Face, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(16.dp))
                    Text("Todavía no has configurado tu rostro para firmar. Hazlo desde tu perfil.", textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = onBack) { Text("Volver") }
                }
                return@Box
            }

            if (!hasCameraPermission) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.Face, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(16.dp))
                    Text("Se necesita acceso a la cámara frontal para verificar tu identidad.", textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) { Text("Permitir cámara") }
                    Spacer(Modifier.height(8.dp))
                    TextButton(onClick = { onNecesitaFirmar("firma_facial") }) { Text("Firmar manualmente sin cámara") }
                }
                return@Box
            }

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val options = FaceDetectorOptions.Builder()
                        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                        .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                        .build()
                    val faceDetector = FaceDetection.getClient(options)
                    previewView.controller = cameraController

                    cameraController.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
                    cameraController.setEnabledUseCases(CameraController.IMAGE_ANALYSIS or CameraController.IMAGE_CAPTURE)

                    cameraController.setImageAnalysisAnalyzer(
                        analysisExecutor,
                        MlKitAnalyzer(
                            listOf(faceDetector),
                            androidx.camera.core.ImageAnalysis.COORDINATE_SYSTEM_VIEW_REFERENCED,
                            analysisExecutor,
                        ) { result ->
                            val rostro = result?.getValue(faceDetector)?.firstOrNull()
                            val caja = rostro?.boundingBox?.let(::Rect)
                            val ojosAbiertos = rostro != null &&
                                (rostro.leftEyeOpenProbability ?: 0f) > 0.4f &&
                                (rostro.rightEyeOpenProbability ?: 0f) > 0.4f

                            ContextCompat.getMainExecutor(ctx).execute actualizarUi@{
                                if (procesando) return@actualizarUi
                                val anchoVista = previewView.width.toFloat()
                                val altoVista = previewView.height.toFloat()
                                val rostroCentrado = caja != null && anchoVista > 0f && altoVista > 0f &&
                                    kotlin.math.abs(caja.centerX() - anchoVista / 2f) < anchoVista * 0.2f &&
                                    kotlin.math.abs(caja.centerY() - altoVista * 0.45f) < altoVista * 0.22f

                                when {
                                    caja == null -> {
                                        framesConRostro = 0
                                        rostroListo = false
                                        mensaje = "Ubica tu rostro dentro del óvalo"
                                    }
                                    !rostroCentrado -> {
                                        framesConRostro = 0
                                        rostroListo = false
                                        mensaje = "Centra tu rostro dentro del óvalo"
                                    }
                                    !ojosAbiertos -> {
                                        framesConRostro = 0
                                        rostroListo = false
                                        mensaje = "Mantén los ojos abiertos"
                                    }
                                    else -> {
                                        framesConRostro = (framesConRostro + 1).coerceAtMost(FRAMES_REQUERIDOS)
                                        rostroListo = framesConRostro >= FRAMES_REQUERIDOS
                                        mensaje = if (rostroListo) "Rostro centrado. Validando..." else "Mantén la posición..."
                                    }
                                }
                            }
                        },
                    )

                    cameraController.bindToLifecycle(lifecycleOwner)
                    previewView
                },
            )

            Box(
                modifier = Modifier
                    .size(width = 230.dp, height = 290.dp)
                    .border(width = 4.dp, color = if (rostroListo || procesando) Color(0xFF16A34A) else Color.White, shape = RoundedCornerShape(50)),
            )

            Column(
                modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                LinearProgressIndicator(
                    progress = { progreso },
                    modifier = Modifier.fillMaxWidth(0.7f).clip(RoundedCornerShape(8.dp)),
                    color = Color(0xFF16A34A),
                    trackColor = Color.White.copy(alpha = 0.3f),
                )
                Spacer(Modifier.height(10.dp))
                Box(modifier = Modifier.background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(12.dp)).padding(horizontal = 16.dp, vertical = 8.dp)) {
                    Text(error ?: mensaje, color = if (error != null) Color(0xFFFCA5A5) else Color.White, fontWeight = FontWeight.Medium)
                }
                if (error != null) {
                    Spacer(Modifier.height(8.dp))
                    TextButton(onClick = { error = null; onNecesitaFirmar("firma_facial") }) {
                        Text("Firmar manualmente", color = Color.White)
                    }
                }
            }
        }
    }
}
