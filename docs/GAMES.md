# Ficha de Juegos

---

## Tirachinas

**Ruta:** `/game`  
**Componente:** `components/SlingshotGame.tsx`  
**Objetivo terapéutico:** Entrenar la fuerza y el rango de movimiento de la pinza (pulgar-índice), la coordinación visomotriz proximal y la estabilidad del gesto de tensado.

### Control
El paciente hace una **pinza** (pulgar contra índice) para agarrar el tirachinas virtual. Mantiene la pinza y arrastra la mano hacia atrás para tensar. Suelca la pinza para lanzar el pájaro.

| Gesto | Acción en juego |
|---|---|
| Pinza cerrada + arrastre | Tensado del tirachinas |
| Pinza abierta (soltar) | Lanzamiento |
| Distancia de arrastre | Potencia del lanzamiento |

### Métricas capturadas
Apertura máxima de pinza · Distancia de pull · Tremor de pull · Precisión  
→ Ver [CLINICAL_METRICS.md](CLINICAL_METRICS.md#tirachinas)

### Parámetros configurables

| Parámetro | Valor actual | Dónde cambiarlo |
|---|---|---|
| Número de pájaros | 5 | `lib/physics/level.ts` → `TOTAL_BIRDS` |
| Distancias de dianas | Cerca / Medio / Lejos | `lib/physics/level.ts` → `TARGET_DISTANCES` |
| Escala de pinza a mundo | 0.7 | `lib/input/HandPinchProvider.ts` → `DRAG_SCALE` |
| Umbral inicio pinza | 0.25 | `lib/pinch-detector.ts` → `START_RATIO` |
| Umbral fin pinza | 0.40 | `lib/pinch-detector.ts` → `END_RATIO` |

### Criterios de fin de sesión
La sesión termina cuando se han lanzado todos los pájaros (5 por defecto). En Test Mode, redirige automáticamente a `/flappy?mode=test` tras 3.5 s en la pantalla de game-over.

---

## Avión

**Ruta:** `/flappy`  
**Componente:** `components/FlappyGame.tsx`  
**Objetivo terapéutico:** Entrenar la flexo-extensión activa de los dedos y la muñeca, la resistencia al esfuerzo (índice de fatiga) y la suavidad del movimiento voluntario (anti-espasticidad).

### Control
El paciente **cierra el puño** para que el avión suba y **lo abre** para que baje. El juego requiere alternar continuamente entre apertura y cierre para mantener el avión entre las columnas.

| Gesto | Acción en juego |
|---|---|
| Puño cerrado (fuerza > 0.5) | El avión sube (aceleración hacia arriba) |
| Puño abierto (fuerza < 0.5) | El avión baja (gravedad) |
| Amplitud del movimiento | Velocidad de respuesta del avión |

### Métricas capturadas
ROM extensión · ROM flexión · Activaciones · Índice de fatiga · Jerk  
→ Ver [CLINICAL_METRICS.md](CLINICAL_METRICS.md#avión)

### Parámetros configurables

| Parámetro | Valor actual | Dónde cambiarlo |
|---|---|---|
| Gravedad del avión | 0.008 | `lib/flappy-logic.ts` → `GRAVITY` |
| Fuerza de impulso | 0.018 | `lib/flappy-logic.ts` → `THRUST` |
| Velocidad de columnas | 3 px/frame | `lib/flappy-logic.ts` → `COLUMN_SPEED` |
| Umbral de activación | 0.5 ± 0.1 | `lib/biomechanics.ts` → `ACTIVATION_THRESHOLD` |
| Factor EMA suavizado | 0.55 | `lib/input/HandPinchProvider.ts` → `EMA_ALPHA` |

### Criterios de fin de sesión
El juego termina cuando el avión choca con una columna o con los bordes superior/inferior. En Test Mode, redirige a `/water?mode=test` tras 3.5 s.

---

## Agua

**Ruta:** `/water`  
**Componente:** `components/WaterGame.tsx`  
**Objetivo terapéutico:** Entrenar la pronosupinación activa de la muñeca, el control motor fino en tareas funcionales de la vida diaria (verter líquidos) y la precisión en el control de amplitud.

### Control
El paciente **rota la muñeca** (como si vertiera un vaso) para inclinar la jarra virtual. Debe verter agua en el vaso evitando las capas de veneno.

| Gesto | Acción en juego |
|---|---|
| Rotación hacia supinación (palma arriba) | Jarra inclina a la izquierda, vierte |
| Rotación hacia pronación (palma abajo) | Jarra inclina a la derecha, vierte |
| Posición neutral (muñeca recta) | Jarra vertical, no vierte |

### Métricas capturadas
ROM supinación · ROM pronación · Precisión de agua · Error de veneno · Jerk · Tiempo de vertido  
→ Ver [CLINICAL_METRICS.md](CLINICAL_METRICS.md#agua)

### Parámetros configurables

| Parámetro | Valor actual | Dónde cambiarlo |
|---|---|---|
| Número de rondas | 3 | `lib/water-logic.ts` → `TOTAL_ROUNDS` |
| Volumen objetivo del vaso | 0.7 (70%) | `lib/water-logic.ts` → `TARGET_FILL_RATIO` |
| Máx. partículas simultáneas | 400 | `lib/water-logic.ts` → `MAX_PARTICLES` |
| Factor LERP de rotación | 0.08 | `components/WaterGame.tsx` → `LERP_FACTOR` |
| Velocidad máxima de rotación | 0.06 rad/frame | `components/WaterGame.tsx` → `MAX_ROT_SPEED` |
| Capas de líquido | agua / veneno / agua | `lib/water-logic.ts` → `LAYER_CONFIG` |

### Criterios de fin de sesión
La sesión termina al completar las 3 rondas. En Test Mode, redirige a `/dashboard`. En modo libre, vuelve a `/`.
