package com.example.actas.ui.screens

import android.Manifest
import android.content.pm.PackageManager
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
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

private const val FRAMES_REQUERIDOS = 15

/**
 * Configura la firma biométrica una sola vez tras el primer login (ver SessionManager.biometriaConfigurada()).
 * Captura una foto del rostro (centrado, ojos abiertos unos frames) y la envía a actas_face_service
 * para que extraiga y guarde el embedding de referencia.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaceEnrollmentScreen(onContinuar: () -> Unit) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()

    var hasCameraPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    var framesConRostro by remember { mutableIntStateOf(0) }
    var mensaje by remember { mutableStateOf("Ubica tu rostro dentro del óvalo") }
    var capturando by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val cameraController = remember { LifecycleCameraController(context) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted },
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    DisposableEffect(Unit) {
        onDispose { cameraController.unbind() }
    }

    fun subirRostro(bytes: ByteArray) {
        scope.launch {
            try {
                val rostroPart = MultipartBody.Part.createFormData(
                    "rostro", "rostro.jpg", bytes.toRequestBody("image/jpeg".toMediaTypeOrNull()),
                )
                app.faceServiceApi.enrolar(rostroPart)
                app.sessionManager.marcarBiometriaConfigurada()
                capturando = false
                onContinuar()
            } catch (e: Exception) {
                capturando = false
                framesConRostro = 0
                error = mensajeDeErrorRed(e)
            }
        }
    }

    fun capturar() {
        if (capturando) return
        capturando = true
        mensaje = "Capturando..."
        cameraController.takePicture(
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageCapturedCallback() {
                override fun onCaptureSuccess(image: ImageProxy) {
                    val buffer = image.planes[0].buffer
                    val bytes = ByteArray(buffer.remaining())
                    buffer.get(bytes)
                    image.close()
                    subirRostro(bytes)
                }

                override fun onError(exception: ImageCaptureException) {
                    capturando = false
                    framesConRostro = 0
                    error = "No se pudo capturar la foto: ${exception.message}"
                }
            },
        )
    }

    val progreso = (framesConRostro.toFloat() / FRAMES_REQUERIDOS).coerceIn(0f, 1f)

    Scaffold(
        topBar = { TopAppBar(title = { Text("Configura tu firma biométrica") }) },
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
            if (!hasCameraPermission) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.Face, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(16.dp))
                    Text("Se necesita acceso a la cámara frontal para registrar tu rostro.", textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) { Text("Permitir cámara") }
                    Spacer(Modifier.height(8.dp))
                    TextButton(onClick = {
                        app.sessionManager.marcarBiometriaConfigurada()
                        onContinuar()
                    }) { Text("Configurar después") }
                }
                return@Box
            }

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val faceDetector = app.faceDetector

                    cameraController.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
                    cameraController.setEnabledUseCases(CameraController.IMAGE_ANALYSIS or CameraController.IMAGE_CAPTURE)

                    cameraController.setImageAnalysisAnalyzer(
                        ContextCompat.getMainExecutor(ctx),
                        MlKitAnalyzer(
                            listOf(faceDetector),
                            androidx.camera.core.ImageAnalysis.COORDINATE_SYSTEM_ORIGINAL,
                            ContextCompat.getMainExecutor(ctx),
                        ) { result ->
                            if (capturando) return@MlKitAnalyzer
                            val rostro = result?.getValue(faceDetector)?.firstOrNull()
                            val ojosAbiertos = rostro != null &&
                                (rostro.leftEyeOpenProbability ?: 0f) > 0.4f &&
                                (rostro.rightEyeOpenProbability ?: 0f) > 0.4f

                            when {
                                rostro == null -> { framesConRostro = 0; mensaje = "Ubica tu rostro dentro del óvalo" }
                                !ojosAbiertos -> { framesConRostro = 0; mensaje = "Mantén los ojos abiertos" }
                                else -> {
                                    framesConRostro++
                                    mensaje = "Mantén la posición..."
                                    if (framesConRostro >= FRAMES_REQUERIDOS) capturar()
                                }
                            }
                        },
                    )

                    cameraController.bindToLifecycle(lifecycleOwner)
                    previewView.controller = cameraController
                    previewView
                },
            )

            Box(
                modifier = Modifier
                    .size(width = 230.dp, height = 290.dp)
                    .border(width = 4.dp, color = if (capturando) Color(0xFF16A34A) else Color.White, shape = RoundedCornerShape(50)),
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
            }
        }
    }
}
