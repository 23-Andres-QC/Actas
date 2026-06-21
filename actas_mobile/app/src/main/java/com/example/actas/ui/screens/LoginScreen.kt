package com.example.actas.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.actas.ActasApplication
import com.example.actas.data.remote.RetrofitClient
import com.example.actas.data.remote.dto.SupabaseLoginRequest
import com.example.actas.ui.theme.BrandAccent
import com.example.actas.ui.theme.BrandPrimary
import kotlinx.coroutines.launch
import retrofit2.HttpException

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val context = LocalContext.current
    val app = context.applicationContext as ActasApplication
    val scope = rememberCoroutineScope()

    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    fun submit() {
        if (email.isBlank() || password.isBlank()) {
            errorMessage = "Completa tu correo y contraseña."
            return
        }
        errorMessage = null
        loading = true
        scope.launch {
            try {
                val response = RetrofitClient.supabaseAuthApi.login(
                    body = SupabaseLoginRequest(email.trim(), password),
                )
                val rol = response.user.appMetadata.rol ?: "asistente"
                app.sessionManager.guardarSesion(
                    accessToken = response.accessToken,
                    refreshToken = response.refreshToken,
                    userId = response.user.id,
                    email = response.user.email,
                    rol = rol,
                )
                loading = false
                onLoginSuccess()
            } catch (e: HttpException) {
                loading = false
                errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña."
            } catch (e: Exception) {
                loading = false
                errorMessage = "No se pudo conectar. Revisa tu conexión e intenta de nuevo."
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(BrandPrimary.copy(alpha = 0.06f), MaterialTheme.colorScheme.background)))
            .padding(horizontal = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Brush.linearGradient(listOf(BrandPrimary, BrandAccent))),
            contentAlignment = Alignment.Center,
        ) {
            Text("A", color = MaterialTheme.colorScheme.surface, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Actas Institucionales", style = MaterialTheme.typography.headlineMedium, color = BrandPrimary, fontWeight = FontWeight.Bold)
        Text(
            "Trazabilidad y seguimiento de acuerdos",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(40.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; errorMessage = null },
            label = { Text("Correo institucional") },
            leadingIcon = { Icon(Icons.Default.Mail, contentDescription = null) },
            singleLine = true,
            isError = errorMessage != null,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
        )

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it; errorMessage = null },
            label = { Text("Contraseña") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            isError = errorMessage != null,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
        )

        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(errorMessage!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { submit() },
            enabled = !loading,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(14.dp),
        ) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
            } else {
                Text("Iniciar sesión", style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}
