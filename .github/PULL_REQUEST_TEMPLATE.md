## Descripción

<!-- Qué cambia este PR y por qué. Una o dos frases. -->

## Tipo de cambio

- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `refactor` — refactor sin cambio funcional
- [ ] `docs` — solo documentación
- [ ] `chore` — mantenimiento, dependencias

---

## Checklist

### General
- [ ] El título del PR sigue Conventional Commits (`tipo(scope): descripción`)
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` pasa sin errores de TypeScript

### UI / Comportamiento visual
- [ ] No aplica
- [ ] He adjuntado screenshot o vídeo del cambio

### Tests
- [ ] No aplica (cambio sin lógica testable)
- [ ] He probado manualmente el flujo afectado en Chrome con webcam
- [ ] He probado el fallback de ratón (`?input=mouse`)

### Impacto en captura de datos clínicos
- [ ] Este PR **no afecta** a telemetría, detectores ni BiomechanicsDSP
- [ ] Este PR **sí afecta** a captura de datos → he verificado que las métricas siguen siendo correctas y he actualizado `docs/CLINICAL_METRICS.md` si es necesario

### Decisión arquitectónica
- [ ] Este PR no introduce decisiones arquitectónicas nuevas
- [ ] Este PR introduce una decisión relevante → he añadido un ADR en `docs/adr/`

---

## Notas para el revisor

<!-- Contexto adicional, puntos de atención, dudas abiertas. -->
