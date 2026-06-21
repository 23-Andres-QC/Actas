package com.example.actas.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Paleta institucional — misma fuente que actas_fronted/src/styles.css (tokens OKLch),
 * convertida a hex para mantener consistencia visual entre web y mobile.
 */

// Marca
val BrandPrimary = Color(0xFF003B8E) // --primary
val BrandPrimaryDark = Color(0xFF002B66) // --sidebar
val BrandAccent = Color(0xFF38BDF8) // --accent / --celeste
val BrandAccentDark = Color(0xFF075985)

// Superficies
val SurfaceBackground = Color(0xFFF1F8FE)
val SurfaceCard = Color(0xFFFFFFFF)
val SurfaceVariant = Color(0xFFE3EEF7)
val SurfaceBorder = Color(0xFFD9EAF7) // --border

// Texto
val TextPrimary = Color(0xFF27364A) // --foreground
val TextMuted = Color(0xFF64748B) // --muted-foreground

// Semáforo (idéntico a SemaforoBadge del web)
val SemaforoVerde = Color(0xFF16A34A) // --success
val SemaforoAmarillo = Color(0xFFFACC15) // --warning
val SemaforoAmarilloTexto = Color(0xFF4A3B05)
val SemaforoRojo = Color(0xFFDC2626) // --destructive
val SemaforoNaranja = Color(0xFFF97316) // --alert

// Contenedores claros para estados
val ContainerPrimaryLight = Color(0xFFDCEEFB)
val ContainerAccentLight = Color(0xFFE0F7FF)
val ContainerSuccessLight = Color(0xFFDCFCE7)
val ContainerWarningLight = Color(0xFFFEF9C3)
val ContainerErrorLight = Color(0xFFFDE2E2)
