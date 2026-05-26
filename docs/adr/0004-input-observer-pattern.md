# ADR-0004: Patrón Observer para el sistema de input

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**Autores:** Equipo FlappyVaina

---

## Contexto

Los juegos necesitan recibir input de dos fuentes posibles:
1. **Mano real** vía MediaPipe (producción).
2. **Ratón** como fallback para desarrollo sin cámara.

Además, en el futuro podría añadirse input táctil, gamepad u otros dispositivos. El código de los juegos no debe saber de dónde viene el input.

Opciones evaluadas:
- Prop drilling del provider desde la página hasta el game engine.
- Context de React para compartir el estado de la mano.
- Patrón Observer con interfaz `InputProvider`.
- Redux / Zustand para estado global.

---

## Decisión

Implementamos un **patrón Observer** con una interfaz `InputProvider` en `lib/input/types.ts`.

```typescript
interface InputProvider {
  subscribe(handler: (event: InputEvent) => void): () => void
  start(): Promise<void>
  stop(): void
}
```

Cada proveedor (`HandPinchProvider`, `MouseInput`) implementa esta interfaz. El game engine recibe un `InputProvider` en su constructor y llama a `subscribe()`. Para cambiar de ratón a mano basta con pasar una instancia diferente; el engine no cambia.

Los eventos tienen tipo `InputEvent`:
```typescript
{
  type: "down" | "move" | "up" | "hover"
  x: number        // píxeles CSS relativos al canvas
  y: number
  pressure?: number  // 0–1, solo fuente de mano
  timestamp: number  // performance.now()
  pinchRatio?: number
}
```

---

## Consecuencias

**Positivas:**
- Desacoplamiento total entre fuente de input y lógica de juego.
- Testing: se puede inyectar un `MockInputProvider` que emite eventos predefinidos.
- Añadir nuevas fuentes (táctil, gamepad) sin tocar ningún game engine.
- Intercambio en runtime: el `tracker` usa el mismo `HandPinchProvider` que los juegos.

**Negativas / Riesgos:**
- Un poco más de indirección que un callback directo. Aceptable dada la ganancia.
- `HandPinchProvider` tiene lógica de pinza acoplada a Tirachinas. Si otro juego necesita pinza con semántica diferente, habrá que parametrizar o crear un proveedor nuevo.
- La interfaz actual no expone estado (¿está la mano detectada? ¿perdida?). Los juegos infieren el estado de la ausencia de eventos. Esto podría mejorarse con eventos de tipo `"lost"` / `"found"`.
