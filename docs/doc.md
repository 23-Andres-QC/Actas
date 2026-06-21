# Sistema de Gestión y Trazabilidad de Actas Institucionales

**Institución:** Instituto Técnico de Comercio Barranquilla

## Motivación

Optimizar la gestión de actas y el seguimiento de compromisos para garantizar el cumplimiento oportuno de los acuerdos, mejorar la coordinación entre las diferentes áreas y reducir la pérdida de información y trazabilidad dentro de la institución.

## Problema

> "Las actas registran acuerdos, pero no garantizan su cumplimiento."

Las áreas académicas y administrativas generan actas de reunión que contienen acuerdos y responsables asignados; sin embargo, el seguimiento de estos compromisos suele realizarse de manera manual o mediante herramientas dispersas, dificultando conocer el estado real de avance de cada acuerdo, validar la participación de los asistentes y asegurar su cumplimiento dentro de los plazos establecidos.

Como consecuencia, se generan retrasos en la ejecución de actividades, pérdida de trazabilidad, incumplimiento de compromisos y dificultades para la toma de decisiones basadas en evidencia actualizada y verificable.

### Indicadores (por validar)

- X% de acuerdos no cuentan con evidencia de cumplimiento.
- X% de actas son firmadas fuera del plazo establecido.
- Los responsables deben revisar múltiples documentos y plataformas para conocer el estado de los acuerdos.
- El seguimiento se realiza mediante correos electrónicos, hojas de cálculo y documentos distribuidos en diferentes repositorios.

## Insight

Los responsables de calidad y acreditación necesitan conocer de manera rápida y confiable qué acuerdos se encuentran pendientes, quiénes son los responsables asignados y qué evidencias respaldan su cumplimiento. Sin embargo, esta información suele encontrarse dispersa en múltiples documentos y plataformas, lo que dificulta la supervisión eficiente, el monitoreo oportuno y la identificación temprana de posibles incumplimientos.

## Solución

> "Convertimos las actas en un sistema inteligente que monitorea, evidencia y predice el cumplimiento de los compromisos institucionales."

Plataforma web y móvil que centraliza la gestión de actas, automatiza el seguimiento de acuerdos y permite monitorear el cumplimiento de compromisos en tiempo real mediante indicadores, gestión de evidencias, alertas y (en una fase posterior) análisis predictivo de riesgos de incumplimiento con IA.

## Propuesta de valor

Transformamos las actas de documentos estáticos en herramientas inteligentes de gestión, seguimiento y cumplimiento. La plataforma proporciona trazabilidad completa sobre cada acuerdo registrado, facilita el seguimiento automatizado de responsables y genera alertas tempranas ante posibles retrasos o incumplimientos. La incorporación de inteligencia artificial (etapa futura) reduce el tiempo dedicado a tareas de supervisión, mejora la transparencia institucional y facilita la toma de decisiones basada en el avance real de los compromisos asumidos.

## Impacto esperado

- Incremento en el cumplimiento de acuerdos institucionales.
- Reducción del tiempo invertido en actividades de seguimiento manual.
- Mejor preparación para procesos de acreditación, evaluación y auditoría.
- Mayor transparencia y trazabilidad de las responsabilidades asignadas.
- Centralización de la información y de las evidencias de cumplimiento.
- Mayor visibilidad del estado de los acuerdos en tiempo real.
- Reducción de acuerdos vencidos o sin seguimiento.
- Fortalecimiento de los procesos de calidad, auditoría y acreditación institucional.

## Roles de usuario

| Rol | Quién lo ocupa | Permisos principales |
|---|---|---|
| **SuperAdmin** | Jefe del área de calidad | Revisa todas las actas de todas las áreas. Asigna Admins a usuarios. |
| **Admin** | Cualquier responsable de área | Revisa las actas de su área. Asigna Convocadores de reunión. |
| **Convocador de reunión** | Cualquier asistente que crea el acta | Convoca reuniones, crea actas, define acuerdos y responsables. |
| **Asistente** | Cualquier miembro de la comunidad académica | Asiste a la reunión, firma asistencia, sube evidencias de sus acuerdos. |

## Documentación por capa

- [Frontend Web](frontend.md) — React (intranet)
- [Backend](backend.md) — ExpressJS, arquitectura DDD
- [Mobile](mobile.md) — Kotlin / Android Studio Pandas 3
- [Base de datos y APIs](database.md) — Postgres, Supabase, resumen de endpoints
- [Infraestructura y seguridad](infraestructura.md)

## Áreas institucionales (mapa de procesos)

**Gestión Directiva** (procesos estratégicos): Direccionamiento Estratégico, Planeación Institucional, Mejoramiento Continuo.

**Gestión de Formación y Acompañamiento** (procesos operativos): Admisiones y Matrículas, Proceso Pedagógico, Procesos Convivenciales, Proyección a la Comunidad.

**Gestión Humana-Administrativa y Financiera** (procesos de soporte): Gestión del Talento Humano, Gestión Financiera, Gestión de la Infraestructura, Adquisición de Bienes y/o Servicios, Gestión Documental.

Estas 12 áreas alimentan la "Satisfacción de la Comunidad Educativa" a partir de las "Necesidades de la Comunidad Educativa", y corresponden a los valores del campo `proceso` del acta (`estrategico` / `operativo` / `soporte`) y a la tabla `area` de la base de datos.
