# FlappyVaina

Plataforma web de entrenamiento y telemonitorización para rehabilitación neuromotora post-ictus. El paciente juega tres mini-juegos controlados con la mano real a través de la cámara web. MediaPipe detecta 21 puntos de la mano en tiempo real; cada juego captura métricas biomecánicas que se agregan en un dashboard clínico.

> Ver [docs/INTENDED_USE.md](docs/INTENDED_USE.md) para declaración de uso y limitaciones clínicas.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.6 — tiene breaking changes vs versiones anteriores ([ADR-0001](docs/adr/0001-nextjs-16.md)) |
| UI | React 19 + TypeScript 5 |
| Gráficos 3D | Three.js 0.184.0 |
| Visión por computador | MediaPipe Tasks Vision 0.10.35 |
| Física 2D | Matter.js 0.20.0 |
| Estilos | Tailwind CSS 4 + inline styles en menú |
| Almacenamiento | localStorage (MVP) — [ADR-0003](docs/adr/0003-localstorage-en-mvp.md) |

---

## Requisitos

- **Navegador:** Chrome 112+ o Edge 112+. Firefox no soporta las APIs de MediaPipe usadas.
- **Webcam:** Cualquier cámara web a 640×480 o superior. La app la usa a 320×240 internamente.
- **Permisos:** El navegador solicitará acceso a cámara al entrar a cualquier juego.
- **Conexión:** Solo necesaria para cargar el modelo de MediaPipe la primera vez (~8 MB, queda cacheado).
- **Node.js:** 20+ para desarrollo local.

---

## Levantar en local

```bash
git clone https://github.com/mpchachi/theactualventure.git
cd theactualventure
npm install
npm run dev
```

Abrir `http://localhost:3000`.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |

---

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Menú principal |
| `/game` | Juego Tirachinas (pinza proximal) |
| `/flappy` | Juego Avión (flexo-extensión distal) |
| `/water` | Juego Agua (pronosupinación) |
| `/dashboard` | Dashboard clínico post-sesión |
| `/tracker` | Calibración y visualización de la mano |

---

## Documentación

| Documento | Descripción |
|---|---|
| [CONTEXT.md](CONTEXT.md) | Contexto técnico completo para onboarding |
| [docs/INTENDED_USE.md](docs/INTENDED_USE.md) | Declaración de uso previsto y limitaciones clínicas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagrama de componentes, flujo de datos y hoja de ruta |
| [docs/CLINICAL_METRICS.md](docs/CLINICAL_METRICS.md) | Definición, fórmulas y rangos de todas las métricas |
| [docs/GAMES.md](docs/GAMES.md) | Ficha terapéutica y parámetros de cada juego |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Qué datos se capturan y dónde se almacenan |
| [docs/adr/](docs/adr/) | Registro de decisiones arquitectónicas (5 ADRs) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Convención de commits, branching y proceso de PR |
| [CHANGELOG.md](CHANGELOG.md) | Historial de cambios |
