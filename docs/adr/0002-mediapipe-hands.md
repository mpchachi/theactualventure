# ADR-0002: MediaPipe HandLandmarker como sistema de visión

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**Autores:** Equipo FlappyVaina

---

## Contexto

El proyecto necesita detectar gestos de la mano en tiempo real desde la cámara web del navegador, sin hardware especial. Los requisitos son:

- Detección de al menos 20 puntos de la mano (landmarks) a ≥20 fps en hardware moderno.
- Ejecución completamente en cliente (sin enviar vídeo a servidor por razones de privacidad).
- Detección de gestos específicos: pinza pulgar-índice, fuerza de puño, rotación de muñeca.
- Licencia compatible con uso comercial.

Opciones evaluadas:
- **MediaPipe Tasks Vision** (Google, 2023+)
- **TensorFlow.js HandPose** (modelo anterior, menor precisión)
- **hand-tracking.js** (wrapper de TF.js, menos mantenido)
- Solución custom con OpenCV.js (descartada por complejidad)

---

## Decisión

Usamos **MediaPipe Tasks Vision 0.10.35** con el modelo `hand_landmarker.task`.

- Modo de ejecución: **VIDEO** (continuo, optimizado para streams).
- Delegado: **GPU** con fallback a CPU automático.
- Landmarks: 21 puntos por mano con coordenadas XYZ normalizadas.
- Carga del modelo: dinámica desde CDN de MediaPipe en primera visita, luego cacheado por el navegador.

Los landmarks se procesan en `lib/fist-detector.ts`, `lib/pinch-detector.ts` y `lib/pronation-detector.ts` en lugar de usar los gestos predefinidos de MediaPipe GestureRecognizer, porque necesitamos métricas continuas (0–1) en lugar de clasificación discreta.

---

## Consecuencias

**Positivas:**
- 21 landmarks a 30 fps en hardware de gama media sin GPU dedicada.
- Ejecución 100% en cliente: nunca se envía vídeo a ningún servidor.
- Licencia Apache 2.0, compatible con uso comercial.
- Modelo ~8 MB, se cachea tras la primera carga.
- Soporte activo de Google con actualizaciones frecuentes.

**Negativas / Riesgos:**
- Degradación notable con mala iluminación o fondos complejos.
- Foreshortening (mano apuntando a cámara) genera jitter en landmarks 2D. Mitigado con EMA + detección de foreshortening + blend con template procedural.
- Solo detecta una mano de forma fiable en el setup actual. Para dos manos habría que cambiar la lógica de selección de mano activa.
- API de MediaPipe Tasks cambia con frecuencia entre versiones menores. La versión está pinada en `package.json`.
- No funciona en Firefox por restricciones de SharedArrayBuffer. Chrome/Edge requeridos.
