# Privacidad y Datos

## Qué captura la plataforma

### Lo que SÍ se captura

| Dato | Descripción | Dónde se procesa |
|---|---|---|
| **Landmarks de mano** | 21 coordenadas XYZ por frame (~30 fps) durante la sesión de juego | Solo en memoria RAM del navegador; nunca se almacenan |
| **TelemetryFrames** | Valores derivados de los landmarks (fuerza de puño, rotación de muñeca, posición de pinza) con timestamp relativo | Memoria RAM durante la sesión; se descartan al cerrar el juego |
| **Métricas clínicas procesadas** | Resultado del análisis biomecánico (ROM, fatiga, jerk, precisión) — ~10 valores numéricos por sesión | localStorage del navegador del paciente |
| **Historial de sesiones** | Array de métricas de todas las sesiones jugadas en ese navegador | localStorage del navegador del paciente |

### Lo que NO se captura

- **Vídeo ni imágenes** de la cámara web. MediaPipe procesa cada frame en memoria y lo descarta inmediatamente. Ningún frame de vídeo se almacena ni transmite.
- **Audio** de ningún tipo.
- **Datos personales identificativos** (nombre, DNI, fecha de nacimiento, diagnóstico clínico).
- **Dirección IP ni metadatos de red** — la plataforma MVP no tiene backend.
- **Cookies de terceros ni analytics**.

---

## Dónde se almacenan los datos

**En el MVP, todos los datos persisten exclusivamente en el `localStorage` del navegador del paciente**, en el dispositivo donde se juega.

Los datos no salen del dispositivo. No hay servidor, base de datos externa, ni transferencia de red de datos de sesión.

Claves de localStorage utilizadas:
```
clinical_metrics_slingshot   → array de SlingshotMetrics
clinical_metrics_flappy      → array de FlappyMetrics
clinical_metrics_water       → array de WaterMetrics
```

---

## Qué pasa si el paciente borra los datos del navegador

Si el paciente borra el historial, la caché o los datos del sitio en su navegador, **los datos de todas las sesiones se pierden permanentemente**. No hay copia de seguridad en el MVP.

Se recomienda que el terapeuta exporte o registre las métricas relevantes del dashboard tras cada sesión hasta que se implemente el backend.

---

## Ausencia de identificación personal

En la versión MVP no se asocia ninguna sesión a ninguna identidad. El dispositivo no sabe quién está jugando. Si dos pacientes usan el mismo ordenador, sus sesiones se mezclarán en el mismo localStorage.

Para uso clínico real con múltiples pacientes en el mismo dispositivo, se recomienda usar perfiles de navegador separados hasta que el sistema de autenticación esté implementado.

---

## Evolución futura

Cuando se introduzca backend y autenticación:
- Este documento se actualizará para reflejar qué datos se transmiten y con qué cifrado.
- Se evaluará el cumplimiento del RGPD (Reglamento General de Protección de Datos, UE 2016/679) para datos de salud.
- Se revisará si la plataforma entra en el ámbito del MDR como software de gestión de datos de salud.
- Se añadirá política de retención y derecho al olvido.
