package com.example.actas.ui.screens

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.EventNote
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.actas.ActasApplication
import com.example.actas.data.remote.ApiConfig
import com.example.actas.data.remote.dto.AcuerdoDto
import com.example.actas.data.remote.dto.ActaDto
import com.example.actas.data.remote.mensajeDeErrorRed
import com.example.actas.ui.theme.SemaforoAmarillo
import com.example.actas.ui.theme.SemaforoAmarilloTexto
import com.example.actas.ui.theme.SemaforoRojo
import com.example.actas.ui.theme.SemaforoVerde
import kotlinx.coroutines.launch

private sealed interface AgreementsUiState {
    data object Loading : AgreementsUiState
    data class Success(val actas: List<ActaDto>, val acuerdos: List<AcuerdoDto>) : AgreementsUiState
    data class Error(val message: String) : AgreementsUiState
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgreementsScreen(
    onScanQR: () -> Unit,
    onUploadEvidence: (String) -> Unit,
    onMiFirma: () -> Unit,
    onLogout: () -> Unit,
) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val scope = rememberCoroutineScope()

    var state by remember { mutableStateOf<AgreementsUiState>(AgreementsUiState.Loading) }
    var mostrandoActas by remember { mutableStateOf(true) }

    fun cargar() {
        state = AgreementsUiState.Loading
        scope.launch {
            state = try {
                AgreementsUiState.Success(
                    actas = app.backendApi.misActas(),
                    acuerdos = app.backendApi.misAcuerdos(),
                )
            } catch (e: Exception) {
                Log.e("AgreementsScreen", "Error al cargar mis acuerdos desde ${ApiConfig.BACKEND_URL}", e)
                AgreementsUiState.Error(mensajeDeErrorRed(e))
            }
        }
    }

    LaunchedEffect(Unit) { cargar() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Mi área", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        app.sessionManager.email()?.let {
                            Text(it, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                },
                actions = {
                    IconButton(onClick = onMiFirma) {
                        Icon(Icons.Default.Draw, contentDescription = "Mi firma")
                    }
                    IconButton(onClick = {
                        app.sessionManager.cerrarSesion()
                        onLogout()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Cerrar sesión")
                    }
                },
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(onClick = onScanQR, icon = { Icon(Icons.Default.QrCodeScanner, contentDescription = null) }, text = { Text("Registrar asistencia") })
        },
    ) { paddingValues ->
        when (val s = state) {
            is AgreementsUiState.Loading -> Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            is AgreementsUiState.Error -> Box(Modifier.fillMaxSize().padding(paddingValues).padding(24.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(s.message, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = { cargar() }) { Text("Reintentar") }
                }
            }
            is AgreementsUiState.Success -> {
                Column(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        FilterChip(
                            selected = mostrandoActas,
                            onClick = { mostrandoActas = true },
                            label = { Text("Actas (${s.actas.size})") },
                            leadingIcon = { Icon(Icons.AutoMirrored.Filled.EventNote, contentDescription = null) },
                        )
                        FilterChip(
                            selected = !mostrandoActas,
                            onClick = { mostrandoActas = false },
                            label = { Text("Acuerdos (${s.acuerdos.size})") },
                        )
                    }

                    val elementosVacios = if (mostrandoActas) s.actas.isEmpty() else s.acuerdos.isEmpty()
                    if (elementosVacios) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                if (mostrandoActas) "No hay actas disponibles para tu área." else "No tienes acuerdos asignados todavía.",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 88.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            if (mostrandoActas) {
                                items(s.actas, key = { it.id }) { acta -> ActaCard(acta) }
                            } else {
                                items(s.acuerdos, key = { it.id }) { acuerdo ->
                                    AcuerdoCard(acuerdo = acuerdo, onUploadEvidence = { onUploadEvidence(acuerdo.id) })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActaCard(acta: ActaDto) {
    val uriHandler = LocalUriHandler.current

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Box(
                    modifier = Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.AutoMirrored.Filled.EventNote, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
                }
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(acta.titulo, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "${acta.fecha.take(10)} · ${acta.lugar}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = if (acta.firmado) "Acta firmada" else "Firma pendiente",
                    tint = if (acta.firmado) SemaforoVerde else MaterialTheme.colorScheme.outlineVariant,
                )
            }

            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (acta.urlReunion != null) {
                    OutlinedButton(onClick = { uriHandler.openUri(acta.urlReunion) }) {
                        Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Ver acta virtual")
                    }
                }
                Text(
                    if (acta.firmado) "Firmada" else "Pendiente de firma",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (acta.firmado) SemaforoVerde else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun AcuerdoCard(acuerdo: AcuerdoDto, onUploadEvidence: () -> Unit) {
    val (semaforoColor, semaforoTexto, semaforoTextColor) = when (acuerdo.estadoSemaforo) {
        "verde" -> Triple(SemaforoVerde, "Cumplido", Color.White)
        "amarillo" -> Triple(SemaforoAmarillo, "En proceso", SemaforoAmarilloTexto)
        else -> Triple(SemaforoRojo, "Vencido", Color.White)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(acuerdo.actaTitulo, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(4.dp))
            Text(acuerdo.descripcion, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)

            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(semaforoColor).padding(horizontal = 10.dp, vertical = 4.dp),
                ) {
                    Text(semaforoTexto, color = semaforoTextColor, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.width(10.dp))
                Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(4.dp))
                Text(
                    "Vence ${acuerdo.fechaFin.take(10)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                LinearProgressIndicator(
                    progress = { (acuerdo.porcentajeAvance / 100).toFloat() },
                    modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp)),
                    color = semaforoColor,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant,
                )
                Spacer(Modifier.width(8.dp))
                Text("${acuerdo.porcentajeAvance.toInt()}%", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            }

            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onUploadEvidence,
                modifier = Modifier.align(Alignment.End),
                shape = RoundedCornerShape(10.dp),
            ) {
                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                Text("Subir evidencia")
            }
        }
    }
}
