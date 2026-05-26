# Métricas Clínicas

Todas las métricas se calculan en `lib/telemetry/biomechanics.ts` a partir de los frames capturados por `SessionLogger`. Se almacenan en localStorage al terminar cada juego.

---

## Tirachinas (`clinical_metrics_slingshot`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **Apertura máxima de pinza** | ROM máximo de apertura pulgar-índice durante la sesión | `max(pinchRatio)` sobre frames con `isPinching=false` | adimensional 0–1 | 0.5–1.0 (patología <0.4) | `calcMaxPinchOpening()` | `pinchRatio`, `isPinching` |
| **Distancia de pull** | Desplazamiento máximo de la mano desde el punto de pinza hasta el punto de máximo tensado | `max(√((pullX-originX)²+(pullY-originY)²))` | píxeles de mundo (WORLD_W=1280) | 150–400 (patología <100) | `calcMaxPullDistance()` | `pullX`, `pullY`, `isPinching` |
| **Tremor de pull** | Jerk (derivada de la aceleración) de la trayectoria de tensado; indica inestabilidad motora | `mean(‖Δ³pos/Δt³‖)` durante frames de `isPinching=true` | px/ms³ | <0.05 normal; >0.10 ataxia | `calcPullTremor()` | `pullX`, `pullY`, `timestamp`, `isPinching` |
| **Precisión** | Ratio de dianas impactadas sobre total de pájaros lanzados | `hits / totalBirds` | ratio 0–1 | >0.6 normal; <0.3 dificultad severa | `calcAccuracy()` | `score`, `birdsLeft` (último frame de cada ronda) |

---

## Avión (`clinical_metrics_flappy`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **ROM extensión** | Rango de apertura máxima del puño (extensión de dedos) | `1 - min(fistStrength)` sobre frames de fase `"playing"` | adimensional 0–1 | >0.7 normal; <0.4 espasticidad | `calcExtensionROM()` | `fistStrength`, `phase` |
| **ROM flexión** | Rango de cierre máximo del puño (flexión de dedos) | `max(fistStrength)` sobre frames de fase `"playing"` | adimensional 0–1 | >0.8 normal; <0.5 paresia | `calcFlexionROM()` | `fistStrength`, `phase` |
| **Activaciones** | Número de repeticiones completas (ciclos apertura→cierre→apertura) | Cruces de umbral 0.5 con histéresis ±0.1 | reps enteras | 15–40 en sesión de ~90s | `calcActivationCount()` | `fistStrength`, `timestamp` |
| **Índice de fatiga** | Decaimiento de la amplitud de movimiento entre la primera y última cuarta parte de la sesión | `1 - (meanPeak_Q4 / meanPeak_Q1)` | ratio 0–1 (0=sin fatiga) | <0.2 normal; >0.4 fatiga severa | `calcFatigueIndex()` | `fistStrength`, `timestamp` |
| **Jerk / Suavidad** | Suavidad del movimiento de flexo-extensión; alta = espasticidad o temblor | `mean(‖d³fistStrength/dt³‖)` | /ms³ | <0.002 normal; >0.005 rigidez | `calcFlappyJerk()` | `fistStrength`, `timestamp` |

---

## Agua (`clinical_metrics_water`)

| Métrica | Definición | Fórmula | Unidades | Rango esperado | Función en biomechanics.ts | Frames consumidos |
|---|---|---|---|---|---|---|
| **ROM supinación** | Ángulo máximo de rotación hacia supinación (palma arriba) | `max(pitcherRotationZ)` en radianes → grados | grados | 40–80° normal; <20° limitación | `calcSupinationROM()` | `pitcherRotationZ`, `phase` |
| **ROM pronación** | Ángulo máximo de rotación hacia pronación (palma abajo) | `abs(min(pitcherRotationZ))` en radianes → grados | grados | 60–80° normal; <30° limitación | `calcPronationROM()` | `pitcherRotationZ`, `phase` |
| **Precisión de agua** | Porcentaje del volumen objetivo alcanzado, promediado por rondas | `mean(glassCurrentVolume / glassTargetVolume)` al fin de cada ronda | % 0–100 | >70% normal | `calcWaterAccuracy()` | `glassCurrentVolume`, `glassTargetVolume`, `round` |
| **Error de veneno** | Volumen total de líquido contaminado vertido en el vaso | `sum(glassPoisonVolume)` al fin de cada ronda | unidades de volumen | <5 normal; >20 control deficiente | `calcPoisonError()` | `glassPoisonVolume`, `round` |
| **Jerk de vertido** | Suavidad de la rotación durante las fases activas de vertido | `mean(‖d³rotation/dt³‖)` en frames de `phase="pouring"` | rad/ms³ | <0.0001 normal; >0.0003 temblor | `calcWaterJerk()` | `pitcherRotationZ`, `timestamp`, `phase` |
| **Tiempo de vertido** | Duración media de cada ronda desde inicio de tilt hasta corte | `mean(t_end_round - t_start_pouring)` por ronda | ms | 3000–8000 ms | `calcPouringTime()` | `timestamp`, `phase`, `round` |

---

## Notas de interpretación

- Los rangos esperados son orientativos y no están validados clínicamente en población controlada.
- Los valores de jerk dependen del framerate real de la sesión. A <20 fps los valores son menos fiables.
- Las métricas de ROM en el juego Agua están en radianes internamente y se convierten a grados solo para el dashboard.
- El índice de fatiga requiere mínimo 40 frames en cada cuartil para ser estadísticamente significativo. Sesiones muy cortas (<30 s) devuelven `null`.
