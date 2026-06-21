package com.example.actas.ui.screens

import android.graphics.Bitmap
import android.net.Uri
import android.view.MotionEvent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.actas.ActasApplication
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.ByteArrayOutputStream

private enum class ModoFirma { DIBUJAR, IMAGEN }

@OptIn(ExperimentalMaterial3Api::class, ExperimentalComposeUiApi::class)
@Composable
fun SignatureScreen(
    actaId: String,
    onSignatureSaved: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val scope = rememberCoroutineScope()

    var modo by remember { mutableStateOf(ModoFirma.DIBUJAR) }
    val paths = remember { mutableStateListOf<Path>() }
    var currentPath by remember { mutableStateOf<Path?>(null) }
    var canvasSize by remember { mutableStateOf(IntSize(800, 400)) }
    var imagenSeleccionada by remember { mutableStateOf<Uri?>(null) }
    var guardando by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        imagenSeleccionada = uri
    }

    fun pathsABytes(): ByteArray {
        val bitmap = Bitmap.createBitmap(canvasSize.width.coerceAtLeast(1), canvasSize.height.coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        val imageBitmap = bitmap.asImageBitmap()
        val canvas = androidx.compose.ui.graphics.Canvas(imageBitmap)
        val drawScope = androidx.compose.ui.graphics.drawscope.CanvasDrawScope()
        drawScope.draw(
            density = androidx.compose.ui.unit.Density(1f),
            layoutDirection = androidx.compose.ui.unit.LayoutDirection.Ltr,
            canvas = canvas,
            size = Size(canvasSize.width.toFloat(), canvasSize.height.toFloat()),
        ) {
            drawRect(color = Color.White)
            paths.forEach { path ->
                drawPath(path = path, color = Color.Black, style = Stroke(width = 6f, cap = StrokeCap.Round, join = StrokeJoin.Round))
            }
        }
        val out = ByteArrayOutputStream()
        imageBitmap.asAndroidBitmap().compress(Bitmap.CompressFormat.PNG, 100, out)
        return out.toByteArray()
    }

    fun guardar() {
        if (modo == ModoFirma.DIBUJAR && paths.isEmpty()) {
            error = "Dibuja tu firma antes de continuar."
            return
        }
        if (modo == ModoFirma.IMAGEN && imagenSeleccionada == null) {
            error = "Selecciona una imagen de tu firma."
            return
        }
        error = null
        guardando = true
        scope.launch {
            try {
                val bytes = withContext(Dispatchers.Default) {
                    if (modo == ModoFirma.DIBUJAR) {
                        pathsABytes()
                    } else {
                        context.contentResolver.openInputStream(imagenSeleccionada!!)?.use { it.readBytes() }
                            ?: throw IllegalStateException("No se pudo leer la imagen")
                    }
                }

                val firmaPart = MultipartBody.Part.createFormData(
                    "firma", "firma.png", bytes.toRequestBody("image/png".toMediaTypeOrNull()),
                )
                val metodoPart = MultipartBody.Part.createFormData(
                    "metodo", "", "firma_facial".toRequestBody("text/plain".toMediaTypeOrNull()),
                )

                app.backendApi.registrarAsistencia(actaId, metodoPart, firmaPart)
                guardando = false
                onSignatureSaved()
            } catch (e: Exception) {
                guardando = false
                error = "No se pudo registrar tu asistencia. Intenta de nuevo."
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Registrar firma") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver") } },
            )
        },
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp)) {
            Text("Confirma tu asistencia firmando a continuación", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = modo == ModoFirma.DIBUJAR,
                    onClick = { modo = ModoFirma.DIBUJAR; error = null },
                    label = { Text("Dibujar firma") },
                    leadingIcon = { Icon(Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(18.dp)) },
                )
                FilterChip(
                    selected = modo == ModoFirma.IMAGEN,
                    onClick = { modo = ModoFirma.IMAGEN; error = null },
                    label = { Text("Subir imagen") },
                    leadingIcon = { Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(18.dp)) },
                )
            }

            Spacer(Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .border(2.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(16.dp))
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .onSizeChanged { canvasSize = it },
                contentAlignment = Alignment.Center,
            ) {
                if (modo == ModoFirma.DIBUJAR) {
                    if (paths.isEmpty()) {
                        Text("Dibuja tu firma con el dedo", color = Color.Gray)
                    }
                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .pointerInteropFilter {
                                when (it.action) {
                                    MotionEvent.ACTION_DOWN -> {
                                        currentPath = Path().apply { moveTo(it.x, it.y) }
                                        true
                                    }
                                    MotionEvent.ACTION_MOVE -> {
                                        currentPath?.lineTo(it.x, it.y)
                                        val temp = currentPath
                                        currentPath = null
                                        currentPath = temp
                                        true
                                    }
                                    MotionEvent.ACTION_UP -> {
                                        currentPath?.let { p -> paths.add(p) }
                                        currentPath = null
                                        true
                                    }
                                    else -> false
                                }
                            },
                    ) {
                        val draw: (Path) -> Unit = { path ->
                            drawPath(path = path, color = Color.Black, style = Stroke(width = 5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                        }
                        paths.forEach(draw)
                        currentPath?.let(draw)
                    }
                } else {
                    if (imagenSeleccionada != null) {
                        AsyncImage(model = imagenSeleccionada, contentDescription = "Firma seleccionada", modifier = Modifier.fillMaxSize())
                    } else {
                        OutlinedButton(onClick = { imagePicker.launch("image/*") }) {
                            Icon(Icons.Default.Image, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Seleccionar imagen de mi firma")
                        }
                    }
                }
            }

            if (error != null) {
                Spacer(Modifier.height(8.dp))
                Text(error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
            }

            Spacer(Modifier.height(16.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedButton(
                    onClick = {
                        if (modo == ModoFirma.DIBUJAR) { paths.clear(); currentPath = null } else { imagenSeleccionada = null }
                    },
                    enabled = !guardando,
                ) { Text("Limpiar") }

                Button(onClick = { guardar() }, enabled = !guardando) {
                    if (guardando) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Confirmar asistencia")
                    }
                }
            }
        }
    }
}
