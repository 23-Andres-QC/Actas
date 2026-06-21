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
import com.example.actas.ui.screens.FaceScanScreen
import com.example.actas.ui.screens.LoginScreen
import com.example.actas.ui.screens.QRScannerScreen
import com.example.actas.ui.screens.SignatureScreen
import com.example.actas.ui.screens.UploadEvidenceScreen

private const val ROUTE_LOGIN = "login"
private const val ROUTE_AGREEMENTS = "agreements"

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val app = LocalContext.current.applicationContext as ActasApplication
    val startDestination = if (app.sessionManager.haySesionActiva()) ROUTE_AGREEMENTS else ROUTE_LOGIN

    NavHost(navController = navController, startDestination = startDestination) {
        composable(ROUTE_LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(ROUTE_AGREEMENTS) { popUpTo(ROUTE_LOGIN) { inclusive = true } }
                },
            )
        }
        composable(ROUTE_AGREEMENTS) {
            AgreementsScreen(
                onScanQR = { navController.navigate("qr_scanner") },
                onUploadEvidence = { agreementId -> navController.navigate("upload_evidence/$agreementId") },
                onLogout = {
                    navController.navigate(ROUTE_LOGIN) { popUpTo(0) { inclusive = true } }
                },
            )
        }
        composable("qr_scanner") {
            QRScannerScreen(
                onQRScanned = { actaId -> navController.navigate("face_scan/$actaId") { popUpTo("qr_scanner") { inclusive = true } } },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "face_scan/{actaId}",
            arguments = listOf(navArgument("actaId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val actaId = backStackEntry.arguments?.getString("actaId") ?: ""
            FaceScanScreen(
                onFaceVerified = { navController.navigate("signature/$actaId") { popUpTo("face_scan/$actaId") { inclusive = true } } },
                onBack = { navController.popBackStack() },
            )
        }
        composable(
            route = "signature/{actaId}",
            arguments = listOf(navArgument("actaId") { type = NavType.StringType }),
        ) { backStackEntry ->
            val actaId = backStackEntry.arguments?.getString("actaId") ?: ""
            SignatureScreen(
                actaId = actaId,
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
