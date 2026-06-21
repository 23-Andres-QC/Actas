package com.example.actas.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
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
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions

private const val FRAMES_REQUERIDOS = 12 // ~liveness sostenido antes de confirmar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaceScanScreen(
    onFaceVerified: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    var framesConRostro by remember { mutableIntStateOf(0) }
    var mensaje by remember { mutableStateOf("Ubica tu rostro dentro del óvalo") }
    var verificado by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted },
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    val progreso = (framesConRostro.toFloat() / FRAMES_REQUERIDOS).coerceIn(0f, 1f)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Verificación facial") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver") }
                },
            )
        },
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
            if (!hasCameraPermission) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(32.dp)) {
                    Icon(Icons.Default.Face, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(16.dp))
                    Text("Se necesita acceso a la cámara frontal para verificar tu presencia.", textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) { Text("Permitir cámara") }
                }
                return@Box
            }

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val cameraController = LifecycleCameraController(ctx)
                    val options = FaceDetectorOptions.Builder()
                        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                        .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                        .build()
                    val faceDetector = FaceDetection.getClient(options)

                    cameraController.setImageAnalysisAnalyzer(
                        ContextCompat.getMainExecutor(ctx),
                        MlKitAnalyzer(
                            listOf(faceDetector),
                            androidx.camera.core.ImageAnalysis.COORDINATE_SYSTEM_ORIGINAL,
                            ContextCompat.getMainExecutor(ctx),
                        ) { result ->
                            if (verificado) return@MlKitAnalyzer
                            val faces = result?.getValue(faceDetector)
                            val rostro = faces?.firstOrNull()

                            val ojosAbiertos = rostro != null &&
                                (rostro.leftEyeOpenProbability ?: 0f) > 0.4f &&
                                (rostro.rightEyeOpenProbability ?: 0f) > 0.4f

                            when {
                                rostro == null -> {
                                    framesConRostro = 0
                                    mensaje = "Ubica tu rostro dentro del óvalo"
                                }
                                !ojosAbiertos -> {
                                    framesConRostro = 0
                                    mensaje = "Mantén los ojos abiertos"
                                }
                                else -> {
                                    framesConRostro++
                                    mensaje = "Mantén la posición..."
                                    if (framesConRostro >= FRAMES_REQUERIDOS) {
                                        verificado = true
                                        mensaje = "¡Identidad verificada!"
                                        onFaceVerified()
                                    }
                                }
                            }
                        },
                    )

                    cameraController.cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
                    cameraController.bindToLifecycle(lifecycleOwner)
                    cameraController.setEnabledUseCases(CameraController.IMAGE_ANALYSIS)
                    previewView.controller = cameraController
                    previewView
                },
            )

            Box(
                modifier = Modifier
                    .size(width = 230.dp, height = 290.dp)
                    .border(width = 4.dp, color = if (verificado) Color(0xFF16A34A) else Color.White, shape = RoundedCornerShape(50)),
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
                Box(
                    modifier = Modifier.background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(12.dp)).padding(horizontal = 16.dp, vertical = 8.dp),
                ) {
                    Text(mensaje, color = Color.White, fontWeight = FontWeight.Medium)
                }
                Spacer(Modifier.height(6.dp))
                Text(
                    "Verificación de presencia (liveness), no biométrica de identidad.",
                    color = Color.White.copy(alpha = 0.7f),
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}
