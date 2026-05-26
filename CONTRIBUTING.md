# Contribuir a FlappyVaina

## Requisitos previos

- Node.js 20+
- Chrome 112+ para probar con MediaPipe
- Una webcam (o usar el fallback de ratón con `?input=mouse` en la URL de cualquier juego)

```bash
git clone https://github.com/mpchachi/theactualventure.git
cd theactualventure
npm install
npm run dev
```

---

## Branching

Usamos **trunk-based development** con feature branches cortas.

- La rama principal es `main`. Siempre debe estar en estado deployable.
- Las ramas de feature se crean desde `main`, duran máximo 2–3 días y se mergean via PR.
- Naming: `feat/descripcion-corta`, `fix/descripcion-corta`, `docs/descripcion-corta`.

```bash
git checkout -b feat/mi-feature
# ... trabaja ...
git push origin feat/mi-feature
# abre PR en GitHub
```

No hay ramas `develop` ni `staging`. Si necesitas un entorno de pruebas, usa un preview deploy.

---

## Commits

Seguimos **Conventional Commits** (`conventionalcommits.org`).

```
<tipo>(scope opcional): descripción en minúsculas

[cuerpo opcional]

[footer opcional]
```

### Tipos válidos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato, espaciado (sin cambio de lógica) |
| `refactor` | Refactor sin nueva funcionalidad ni fix |
| `test` | Añadir o corregir tests |
| `chore` | Tareas de mantenimiento (deps, config) |
| `perf` | Mejora de rendimiento |

### Ejemplos

```
feat(water): add poison layer shuffle per round
fix(flappy): prevent jerk spike on first frame after hand loss
docs(adr): add ADR-0005 detection parameters
chore: bump mediapipe to 0.10.36
```

### Scope recomendados

`menu`, `slingshot`, `flappy`, `water`, `dashboard`, `tracker`, `input`, `telemetry`, `physics`, `mediapipe`, `docs`, `deps`

---

## Lint y build

```bash
npm run lint        # ESLint
npm run build       # Build de producción (detecta errores de TypeScript)
```

Ambos deben pasar en verde antes de abrir un PR. El CI los ejecuta automáticamente.

---

## Template de PR

Ver [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). GitHub lo carga automáticamente al abrir un PR.

Puntos clave:
- Descripción clara de qué cambia y por qué.
- Screenshot o vídeo si el cambio afecta a UI o comportamiento visual.
- Si la decisión tiene implicaciones arquitectónicas, añadir un ADR en `docs/adr/`.
- Si el cambio afecta a la captura de datos clínicos, indicarlo explícitamente.

---

## Añadir un juego nuevo

1. Crear componente en `components/NuevoJuego.tsx`.
2. Crear ruta en `app/nuevo-juego/page.tsx` con `dynamic(() => import(...), { ssr: false })`.
3. Añadir entrada en el array de juegos en `app/page.tsx`.
4. Implementar función de análisis en `lib/telemetry/biomechanics.ts`.
5. Añadir clave en localStorage con prefijo `clinical_metrics_`.
6. Añadir ficha en `docs/GAMES.md`.
7. Añadir tabla de métricas en `docs/CLINICAL_METRICS.md`.
8. Conectar al Test Mode en el game-over del juego anterior.
