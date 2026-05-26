# ADR-0003: localStorage como almacenamiento en MVP

**Estado:** Aceptado (temporal, revisar al introducir backend)  
**Fecha:** 2026-05-26  
**Autores:** Equipo FlappyVaina

---

## Contexto

Las métricas clínicas generadas por cada sesión de juego necesitan persistir entre visitas al dashboard. Las opciones son:

- **localStorage** del navegador (sin backend).
- **IndexedDB** del navegador (más capacidad, más complejo).
- **Backend propio** con base de datos (mayor infraestructura).
- **Servicio tercero** (Firebase, Supabase, etc.).

En fase MVP el objetivo es validar que las métricas son clínicamente útiles antes de invertir en infraestructura. No hay aún identidad de paciente, sistema de autenticación ni necesidad de compartir datos entre dispositivos.

---

## Decisión

Usamos **localStorage** para persisitir las métricas clínicas procesadas.

Claves utilizadas:
- `clinical_metrics_slingshot` — array de objetos `SlingshotMetrics`
- `clinical_metrics_flappy` — array de objetos `FlappyMetrics`
- `clinical_metrics_water` — array de objetos `WaterMetrics`

Los frames raw de telemetría **no se persisten** — solo el resultado procesado por `BiomechanicsDSP`.

---

## Consecuencias

**Positivas:**
- Cero infraestructura: no hay servidor, no hay base de datos, no hay costes.
- Implementación en minutos.
- Los datos nunca salen del dispositivo del paciente (ventaja de privacidad en MVP).
- Suficiente para demos, validación clínica y primeros usuarios piloto.

**Negativas / Riesgos:**
- Los datos se pierden si el paciente borra el historial del navegador o cambia de dispositivo.
- Sin identidad: no se puede asociar una sesión a un paciente específico.
- Sin sincronización: el terapeuta no ve los datos en tiempo real desde su propio dispositivo.
- Límite de ~5 MB por origen. Con métricas pequeñas (~1 KB por sesión) no es un problema inmediato.
- Esta decisión **bloquea la telemonitorización real** hasta que se introduzca backend. Es la deuda técnica más importante del MVP.

**Plan de migración:**
Cuando se añada backend, `BiomechanicsDSP` añadirá un paso de `POST /api/sessions` tras escribir en localStorage. El localStorage actuará como caché offline. El dashboard leerá desde la API en lugar de desde localStorage.
