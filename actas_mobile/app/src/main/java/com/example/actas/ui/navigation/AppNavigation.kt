package com.example.actas.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.actas.ActasApplication
import com.example.actas.ui.screens.AgreementsScreen
import com.example.actas.ui.screens.FaceEnrollmentScreen
import com.example.actas.ui.screens.FaceVerificationScreen
import com.example.actas.ui.screens.LoginScreen
import com.example.actas.ui.screens.QRScannerScreen
import com.example.actas.ui.screens.SignatureScreen
import com.example.actas.ui.screens.UploadEvidenceScreen

private const val ROUTE_LOGIN = "login"
private const val ROUTE_BIOMETRIC_SETUP = "face_enrollment"
private const val ROUTE_AGREEMENTS = "agreements"
private const val ROUTE_MI_FIRMA = "mi_firma"

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val app = LocalContext.current.applicationContext as ActasApplication
    val startDestination = if (app.sessionManager.haySesionActiva()) ROUTE_AGREEMENTS else ROUTE_LOGIN

    NavHost(navController = navController, startDestination = startDestination) {
        composable(ROUTE_LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    val destino = if (app.sessionManager.biometriaConfigurada()) ROUTE_AGREEMENTS else ROUTE_BIOMETRIC_SETUP
                    navController.navigate(destino) { popUpTo(ROUTE_LOGIN) { inclusive = true } }
                },
            )
        }
        composable(ROUTE_BIOMETRIC_SETUP) {
            FaceEnrollmentScreen(
                onContinuar = {
                    navController.navigate(ROUTE_AGREEMENTS) { popUpTo(ROUTE_BIOMETRIC_SETUP) { inclusive = true } }
                },
            )
        }
        composable(ROUTE_AGREEMENTS) {
            AgreementsScreen(
                onScanQR = { navController.navigate("qr_scanner") },
                onUploadEvidence = { agreementId -> navController.navigate("upload_evidence/$agreementId") },
                onMiFirma = { navController.navigate(ROUTE_MI_FIRMA) },
                onLogout = {
                    navController.navigate(ROUTE_LOGIN) { popUpTo(0) { inclusive = true } }
                },
            )
        }
        composable(ROUTE_MI_FIRMA) {
            SignatureScreen(
                onSignatureSaved = { navController.popBackStack() },
                onBack = { navController.popBackStack() },
            )
        }
        composable("qr_scanner") {
            QRScannerScreen(
                onQRScanned = { actaId, qrToken ->
                    navController.navigate("biometric_verify/$actaId/$qrToken") { popUpTo("qr_scanner") { inclusive = true } }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "biometric_verify/{actaId}/{qrToken}",
            arguments = listOf(
                navArgument("actaId") { type = NavType.StringType },
                navArgument("qrToken") { type = NavType.StringType },
            ),
        ) { backStackEntry ->
            val actaId = backStackEntry.arguments?.getString("actaId") ?: ""
            val qrToken = backStackEntry.arguments?.getString("qrToken") ?: ""
            FaceVerificationScreen(
                actaId = actaId,
                qrToken = qrToken,
                onAsistenciaRegistrada = {
                    navController.navigate(ROUTE_AGREEMENTS) { popUpTo(ROUTE_AGREEMENTS) { inclusive = true } }
                },
                onNecesitaFirmar = { metodo ->
                    navController.navigate("signature/$actaId/$qrToken/$metodo") {
                        popUpTo("biometric_verify/$actaId/$qrToken") { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "signature/{actaId}/{qrToken}/{metodo}",
            arguments = listOf(
                navArgument("actaId") { type = NavType.StringType },
                navArgument("qrToken") { type = NavType.StringType },
                navArgument("metodo") { type = NavType.StringType },
            ),
        ) { backStackEntry ->
            val actaId = backStackEntry.arguments?.getString("actaId") ?: ""
            val qrToken = backStackEntry.arguments?.getString("qrToken")
            val metodo = backStackEntry.arguments?.getString("metodo") ?: "firma_facial"
            SignatureScreen(
                actaId = actaId,
                metodo = metodo,
                qrToken = qrToken,
                onSignatureSaved = {
                    navController.navigate(ROUTE_AGREEMENTS) { popUpTo(ROUTE_AGREEMENTS) { inclusive = true } }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "upload_evidence/{agreementId}",
            arguments = listOf(navArgument("agreementId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val agreementId = backStackEntry.arguments?.getString("agreementId") ?: ""
            UploadEvidenceScreen(
                agreementId = agreementId,
                onEvidenceUploaded = { navController.popBackStack() },
                onBack = { navController.popBackStack() },
            )
        }
    }
}
