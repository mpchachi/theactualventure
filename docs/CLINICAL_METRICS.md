# Métricas Clínicas

Todas las métricas se calculan en `lib/telemetry/biomechanics.ts` a partir de los frames capturados por `SessionLogger`. Se almacenan en localStorage al terminar cada juego.

---

## Tirachinas (`clinical_metrics_slingshot`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **Apertura máxima de pinza** | ROM máximo de apertura pulgar-índice durante la sesión | `max(pinchRatio)` sobre frames con `isPinching=false` | adimensional 0–1 | 0.5–1.0 (patología <0.4) | `calcMaxPinchOpening()` | `pinchRatio`, `isPinching` |
| **Distancia de pull** | Desplazamiento máximo de la mano desde el punto de pinza hasta el punto de máximo tensado | `max(√((pullX-originX)²+(pullY-originY)²))` | píxeles de mundo (WORLD_W=1280) | 150–400 (patología <100) | `calcMaxPullDistance()` | `pullX`, `pullY`, `isPinching` |
| **Tremor de pull** | Coeficiente de variación de la velocidad 2D durante tensado; indica inestabilidad motora | `CV(speeds)` = `σ(speed) / μ(speed)` con media móvil de 5 frames, durante `isPinching=true` | adimensional | ≤3 estable; >3 ataxia | `processSlingshotMetrics()` | `pullX`, `pullY`, `timestamp`, `isPinching` |
| **Precisión** | Ratio de dianas impactadas sobre total de pájaros lanzados | `hits / totalBirds` | ratio 0–1 | >0.6 normal; <0.3 dificultad severa | `calcAccuracy()` | `score`, `birdsLeft` (último frame de cada ronda) |

---

## Avión (`clinical_metrics_flappy`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **ROM extensión** | Rango de apertura máxima del puño (extensión de dedos) | `1 - min(fistStrength)` sobre frames de fase `"playing"`. Dashboard muestra `(1 - maxExtension) * 100%` | adimensional 0–1 | >0.7 normal; <0.4 espasticidad | `processFlappyMetrics()` | `fistStrength`, `phase` |
| **ROM flexión** | Rango de cierre máximo del puño (flexión de dedos) | `max(fistStrength)` sobre frames de fase `"playing"` | adimensional 0–1 | >0.8 normal; <0.5 paresia | `calcFlexionROM()` | `fistStrength`, `phase` |
| **Activaciones** | Número de repeticiones completas (ciclos apertura→cierre→apertura) | Cruces de umbral 0.5 con histéresis ±0.1 | reps enteras | 15–40 en sesión de ~90s | `calcActivationCount()` | `fistStrength`, `timestamp` |
| **Índice de fatiga** | Decaimiento de la amplitud de movimiento entre la primera y última cuarta parte de la sesión | `1 - (meanPeak_Q4 / meanPeak_Q1)` | ratio 0–1 (0=sin fatiga) | <0.2 normal; >0.4 fatiga severa | `calcFatigueIndex()` | `fistStrength`, `timestamp` |
| **Suavidad (CV velocidad)** | Irregularidad de la velocidad de flexo-extensión; alta = espasticidad o temblor | `CV(speeds)` = `σ(speed) / μ(speed)` con media móvil de 5 frames | adimensional | ≤3 fluido; >3 rigidez | `processFlappyMetrics()` | `fistStrength`, `timestamp` |

---

## Agua (`clinical_metrics_water`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **ROM supinación** | Ángulo máximo de rotación hacia supinación (palma arriba) | `max(pitcherRotationZ)` en radianes → grados | grados | 40–80° normal; <20° limitación | `calcSupinationROM()` | `pitcherRotationZ`, `phase` |
| **ROM pronación** | Ángulo máximo de rotación hacia pronación (palma abajo) | `abs(min(pitcherRotationZ))` en radianes → grados | grados | 60–80° normal; <30° limitación | `calcPronationROM()` | `pitcherRotationZ`, `phase` |
| **Precisión de agua** | Porcentaje del volumen objetivo alcanzado, promediado por rondas | `mean(glassCurrentVolume / glassTargetVolume)` al fin de cada ronda | % 0–100 | >70% normal | `calcWaterAccuracy()` | `glassCurrentVolume`, `glassTargetVolume`, `round` |
| **Error de veneno** | Volumen total de líquido contaminado vertido en el vaso | `sum(glassPoisonVolume)` al fin de cada ronda | unidades de volumen | <5 normal; >20 control deficiente | `calcPoisonError()` | `glassPoisonVolume`, `round` |
| **Suavidad de vertido (CV velocidad angular)** | Irregularidad de la velocidad de rotación durante vertido | `CV(angularSpeeds)` = `σ(speed) / μ(speed)` con media móvil de 5 frames, en `phase="pouring"` | adimensional | ≤3 suave; >3 inestable | `processWaterMetrics()` | `pitcherRotationZ`, `timestamp`, `phase` |
| **Tiempo de vertido** | Duración media de cada ronda desde inicio de tilt hasta corte | `mean(t_end_round - t_start_pouring)` por ronda | ms | 3000–8000 ms | `calcPouringTime()` | `timestamp`, `phase`, `round` |

---

## Notas de interpretación

- Los rangos esperados son orientativos y no están validados clínicamente en población controlada.
- Las métricas de suavidad/temblor usan **coeficiente de variación de la velocidad** (CV = σ/μ). Este enfoque es independiente del framerate y robusto frente al ruido de la cámara, a diferencia del jerk crudo (tercera derivada) que amplificaba el ruido de MediaPipe.
- Todas las señales se suavizan con una **media móvil de 5 frames** antes de calcular la velocidad, eliminando el ruido de alta frecuencia de la detección sin perder temblor clínico real (que opera a <8 Hz).
- Las métricas de ROM en el juego Agua están en radianes internamente y se convierten a grados solo para el dashboard.
- El índice de fatiga requiere mínimo 40 frames en cada cuartil para ser estadísticamente significativo. Sesiones muy cortas (<30 s) devuelven `null`.
- La detección del puño usa distancia 3D entre punta y base de cada dedo, normalizada por la escala de la palma. El suavizado EMA se aplica por igual en X, Y y Z (α=0.55).
