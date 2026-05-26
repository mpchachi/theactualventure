# Arquitectura

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegador del paciente                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │   Webcam     │───▶│  MediaPipe HandLandmarker        │  │
│  │  (320×240)   │    │  (21 landmarks, modo VIDEO)      │  │
│  └──────────────┘    └──────────────┬───────────────────┘  │
│                                     │ landmarks[]           │
│                      ┌──────────────▼───────────────────┐  │
│                      │  Detectores (lib/)               │  │
│                      │  · FistDetector   → fuerza 0–1   │  │
│                      │  · PinchDetector  → estado pinza │  │
│                      │  · PronationDetector → rotación  │  │
│                      └──────────────┬───────────────────┘  │
│                                     │ InputEvent            │
│                      ┌──────────────▼───────────────────┐  │
│                      │  InputProvider (Observer)        │  │
│                      │  HandPinchProvider / MouseInput  │  │
│                      └──────────────┬───────────────────┘  │
│                                     │                       │
│         ┌───────────────────────────┼──────────────────┐   │
│         ▼                           ▼                   ▼   │
│  ┌─────────────┐          ┌──────────────┐   ┌──────────┐  │
│  │ Slingshot   │          │  FlappyGame  │   │WaterGame │  │
│  │ Game        │          │  (Three.js)  │   │(Three.js)│  │
│  │ (Matter.js) │          └──────┬───────┘   └────┬─────┘  │
│  └──────┬──────┘                 │                │        │
│         │                        │                │        │
│         └────────────────────────┼────────────────┘        │
│                                  │ TelemetryFrame[]         │
│                      ┌───────────▼──────────────────────┐  │
│                      │  BiomechanicsDSP (biomechanics.ts)│  │
│                      │  Procesa frames → métricas        │  │
│                      └───────────┬──────────────────────┘  │
│                                  │ ClinicalMetrics          │
│                      ┌───────────▼──────────────────────┐  │
│                      │  localStorage                    │  │
│                      │  clinical_metrics_*              │  │
│                      └───────────┬──────────────────────┘  │
│                                  │                          │
│                      ┌───────────▼──────────────────────┐  │
│                      │  Dashboard (/dashboard)           │  │
│                      │  Visualización de métricas        │  │
│                      └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de datos

```
Cámara → MediaPipe → Landmarks (21 puntos XYZ)
                          │
                    Suavizado EMA (α=0.55, X/Y/Z uniforme)
                          │
                    Detectores especializados
                          │
                    InputEvent (x, y, pressure, timestamp)
                          │
                    Game Engine (lógica de juego)
                          │
                    SessionLogger.logFrame()  ← un frame por tick
                          │
                    TelemetryFrame[] (en memoria durante la sesión)
                          │
                    BiomechanicsDSP.analyze()  ← al terminar el juego
                          │
                    ClinicalMetrics  →  localStorage
                          │
                    Dashboard  →  Visualización terapeuta
```

### Dónde vive cada dato

| Dato | Dónde | Cuándo desaparece |
|---|---|---|
| Frames de vídeo | Nunca se almacenan | N/A |
| Landmarks raw | Memoria RAM (buffer de 1 frame) | Cada tick |
| TelemetryFrames de sesión | Memoria RAM | Al cerrar el juego |
| ClinicalMetrics procesadas | localStorage | Al borrar datos del navegador |
| Histórico de sesiones | localStorage (array) | Al borrar datos del navegador |

---

## Decisiones arquitectónicas

Ver carpeta [`docs/adr/`](adr/) para el registro completo de decisiones.

Resumen de las más relevantes:

- **Next.js 16** — [ADR-0001](adr/0001-nextjs-16.md)
- **MediaPipe en cliente** — [ADR-0002](adr/0002-mediapipe-hands.md)
- **localStorage en MVP** — [ADR-0003](adr/0003-localstorage-en-mvp.md)
- **Patrón Observer para input** — [ADR-0004](adr/0004-input-observer-pattern.md)
- **Parámetros de detección** — [ADR-0005](adr/0005-parametros-deteccion.md)

---

## Hoja de ruta técnica

### Backend y persistencia real

En la versión post-MVP se introducirá un backend (probablemente Next.js API Routes + base de datos relacional) para:

- Autenticación de paciente y terapeuta.
- Persistencia de sesiones vinculada a un ID de paciente.
- API para que el dashboard del terapeuta agregue sesiones de múltiples pacientes.
- Exportación de datos clínicos en formatos interoperables (FHIR, CSV).

Las decisiones actuales —localStorage, ausencia de IDs, métricas en cliente— están tomadas conscientemente para acelerar la validación clínica sin infraestructura. No son deuda técnica ignorada sino deuda deliberada y documentada.

### Catálogo de juegos

El diseño actual de tres juegos está pensado para escalar a un catálogo. Cada juego es un componente independiente que implementa la interfaz `GameComponent` (input provider + session logger + métricas propias). Al añadir un juego nuevo solo se necesita: componente + ruta + ficha en `docs/GAMES.md` + función de análisis en `biomechanics.ts`. El menú principal y el Test Mode se configurarán dinámicamente desde un array de juegos activos.
