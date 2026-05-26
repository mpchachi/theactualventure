# FlappyVaina — Documento de Contexto del Proyecto

## ¿Qué es esto?

Plataforma web de **rehabilitación neuromotora para pacientes de ictus**. El paciente juega 3 mini-juegos controlados con la mano real a través de la cámara web. MediaPipe detecta 21 puntos de la mano en tiempo real y cada juego captura métricas biomecánicas clínicas que se muestran en un dashboard para el terapeuta.

**Repo:** https://github.com/mpchachi/theactualventure  
**Stack:** Next.js 16.2.6 · React 19 · Three.js · MediaPipe · Matter.js · Tailwind CSS 4 · TypeScript

---

## Rutas de la aplicación

| Ruta | Descripción |
|---|---|
| `/` | Menú principal low-poly (crema/sage, inline styles) |
| `/game` | Juego Tirachinas — control de pinza proximal |
| `/flappy` | Juego Avión — flexo-extensión distal |
| `/water` | Juego Agua — pronosupinación de muñeca |
| `/dashboard` | Dashboard clínico con métricas de la sesión |
| `/tracker` | Calibración y visualización en vivo de la mano |

---

## Los 3 juegos

### 1. Tirachinas (`components/SlingshotGame.tsx`)
El paciente hace pinza pulgar-índice para tensar y lanzar un pájaro hacia dianas. 5 pájaros por sesión, dianas a 3 distancias. Física 2D con Matter.js.

**Control:** Pinza = tensado. Abrir = lanzar.  
**Métricas clínicas:** apertura máxima de pinza (ROM), distancia de tensado (fuerza proximal), tremor del pull, precisión (dianas/pájaros).

---

### 2. Avión (`components/FlappyGame.tsx`)
Avión de papel que esquiva columnas. El paciente abre y cierra el puño para controlar la altura. Puño cerrado = subir, puño abierto = bajar. Gráficos 3D con Three.js.

**Control:** Fuerza de puño 0–1 mapeada a aceleración vertical.  
**Métricas clínicas:** ROM extensión máxima, ROM flexión máxima, número de activaciones (reps), índice de fatiga, jerk/suavidad del movimiento.

---

### 3. Agua (`components/WaterGame.tsx`)
Jarra 3D que el paciente inclina rotando la muñeca para verter agua en un vaso sin derramar veneno. 3 capas de líquido (agua/veneno/agua), 3 rondas por sesión. Three.js + sistema de partículas.

**Control:** Rotación de muñeca (pronosupinación) → inclinación de la jarra.  
**Métricas clínicas:** ángulo máximo de supinación y pronación (ROM), precisión del agua vertida, error de veneno, jerk durante el vertido.

---

## Flujo Test Mode

Al pulsar "Iniciar test" o con `?mode=test` en la URL:

```
/game?mode=test
    ↓ (al terminar, auto-redirige)
/flappy?mode=test
    ↓ (al terminar, auto-redirige)
/water?mode=test
    ↓ (al completar 3 rondas)
/dashboard
```

---

## Sistema de visión por computador

- **MediaPipe HandLandmarker** modo VIDEO (detección continua)
- 21 landmarks por mano, confianza mínima 0.4
- Resolución de cámara: 320×240 (ligero, suficiente para detección)
- **Suavizado EMA** α=0.55 para estabilizar posiciones
- Detección de foreshortening (mano apuntando a cámara) → blend con template procedural para evitar jitter

### Detectores
| Archivo | Qué detecta |
|---|---|
| `lib/fist-detector.ts` | Fuerza de puño 0–1 (distancia punta-base de dedos) |
| `lib/pinch-detector.ts` | Estado pinza pulgar-índice (máquina de estados con histéresis) |
| `lib/pronation-detector.ts` | Ángulo de rotación de muñeca desde posición de nudillos MCP |

---

## Sistema de input (`lib/input/`)

Patrón Observer. Evento tipado:
```typescript
{
  type: "down" | "move" | "up" | "hover"
  x: number        // píxeles CSS relativos al canvas
  y: number
  pressure?: number  // 0–1, solo mano
  timestamp: number  // performance.now()
  pinchRatio?: number
}
```

- **HandPinchProvider.ts** — mano real vía MediaPipe → InputEvents
- **MouseInput.ts** — ratón como fallback para desarrollo sin cámara

---

## Telemetría (`lib/telemetry/`)

### SessionLogger (`datalogger.ts`)
Captura un frame por llamada a `logFrame()`. Timestamps relativos al inicio de sesión. Todo en memoria, devuelve array al llamar `stop()`.

### BiomechanicsDSP (`biomechanics.ts`)
Procesa frames crudos → métricas clínicas finales. Se ejecuta al terminar cada juego.

### Storage
Métricas guardadas en **localStorage** (sin backend):
- `clinical_metrics_slingshot`
- `clinical_metrics_flappy`
- `clinical_metrics_water`

---

## Dashboard (`app/dashboard/page.tsx`)

Lee las métricas de localStorage y muestra 3 tarjetas:

| Tarjeta | Juego | Qué muestra |
|---|---|---|
| Módulo Proximal | Tirachinas | Gauges pinza + precisión, barra extensión, badge tremor |
| Flexoextensión Distal | Avión | Gauges ROM ext/flex, activaciones, fatiga, badge espasticidad |
| Pronosupinación | Agua | Gauges pronación/supinación, barras precisión y veneno, badge tremor |

---

## Menú principal (`app/page.tsx` + `app/globals.css`)

**100% inline styles** — no usa Tailwind para evitar conflictos de clases.

### Paleta (nunca cambiar)
```css
--cream:      #f5f0e8   /* fondo principal */
--cream-soft: #ece6dc
--sand:       #dce5d4
--sage-soft:  #c4d3ba
--sage:       #a8c0a0
--sage-deep:  #7d9b76   /* color primario, botones, acentos */
--ink:        #1a1c18   /* texto principal */
--ink-soft:   #4a4a4a   /* texto secundario */
```

### Tipografías
- **Syne** — títulos y display (h1, números de cards)
- **Plus Jakarta Sans** — cuerpo, párrafos, UI

### Elementos visuales
- SVGs geométricos low-poly animados (nubes flotantes)
- Montañas: SVG único `preserveAspectRatio="none"` pegado a `bottom-0`
- Cards con `background: rgba(255,255,255,0.72)` y `backdropFilter: blur(2px)`
- Animaciones: `float-y` (nubes) y `drift-x` (polígonos laterales)

---

## Estructura de archivos

```
FlappyVaina/
├── app/
│   ├── page.tsx                ← Menú principal
│   ├── game/page.tsx           ← Página Tirachinas
│   ├── flappy/page.tsx         ← Página Avión
│   ├── water/page.tsx          ← Página Agua
│   ├── dashboard/page.tsx      ← Dashboard clínico
│   ├── tracker/page.tsx        ← Calibración cámara
│   ├── layout.tsx              ← Root layout
│   └── globals.css             ← Variables CSS + clases .lp-*
│
├── components/
│   ├── SlingshotGame.tsx       ← Juego tirachinas completo
│   ├── FlappyGame.tsx          ← Juego avión completo
│   ├── WaterGame.tsx           ← Juego agua completo
│   └── HandTracker.tsx         ← Visualizador de mano en vivo
│
└── lib/
    ├── input/
    │   ├── HandPinchProvider.ts
    │   └── MouseInput.ts
    ├── telemetry/
    │   ├── datalogger.ts
    │   └── biomechanics.ts
    ├── physics/
    │   ├── world.ts
    │   ├── slingshot.ts
    │   └── level.ts
    ├── hand3d-procedural.ts    ← Mano low-poly procedural
    ├── fist-detector.ts
    ├── pinch-detector.ts
    ├── pronation-detector.ts
    ├── flappy-logic.ts
    ├── flappy-scene.ts
    ├── water-logic.ts
    └── water-scene.ts
```

---

## Reglas importantes para modificar el código

1. **Next.js 16.2.6 tiene breaking changes** respecto a versiones anteriores. Leer `node_modules/next/dist/docs/` antes de tocar routing, layouts o APIs.

2. **Los juegos usan `dynamic()` con `ssr: false`** — son WebGL/canvas client-side. No funcionan en servidor. No intentar SSR.

3. **El menú usa inline styles, no Tailwind**. No mezclar. Si se añade algo al menú, usar inline styles.

4. **La paleta de colores no se toca**. Están en `:root` de `globals.css` y se usan en toda la app.

5. **No hay backend**. Todo el almacenamiento es `localStorage`. No añadir llamadas a API externas sin consenso.

6. **MediaPipe se carga dinámicamente** desde CDN en los componentes de juego. No importar de forma estática.

7. **Tailwind v4** — sintaxis diferente a v3. No usar `@apply` con clases que no estén en `@layer components`.
