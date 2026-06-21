package com.example.actas.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = BrandPrimary,
    onPrimary = Color.White,
    primaryContainer = ContainerPrimaryLight,
    onPrimaryContainer = BrandPrimary,
    secondary = BrandAccent,
    onSecondary = Color.White,
    secondaryContainer = ContainerAccentLight,
    onSecondaryContainer = BrandAccentDark,
    tertiary = SemaforoVerde,
    onTertiary = Color.White,
    background = SurfaceBackground,
    onBackground = TextPrimary,
    surface = SurfaceCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = TextMuted,
    error = SemaforoRojo,
    onError = Color.White,
    errorContainer = ContainerErrorLight,
    onErrorContainer = Color(0xFF7F1D1D),
    outline = SurfaceBorder,
    outlineVariant = SurfaceVariant,
)

private val DarkColorScheme = darkColorScheme(
    primary = BrandAccent,
    onPrimary = Color(0xFF00263D),
    primaryContainer = BrandAccentDark,
    onPrimaryContainer = Color.White,
    secondary = BrandAccent,
    onSecondary = Color(0xFF00263D),
    background = Color(0xFF101826),
    onBackground = Color(0xFFE7F1FA),
    surface = Color(0xFF182233),
    onSurface = Color(0xFFE7F1FA),
    error = SemaforoRojo,
    onError = Color.White,
)

/**
 * Sin dynamicColor: la app siempre usa la paleta institucional, igual en todos los dispositivos
 * y consistente con la identidad visual del frontend web (no se adapta al wallpaper del usuario).
 */
@Composable
fun ActasTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content,
    )
}
