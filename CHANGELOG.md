# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
El versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Added
- Menú principal low-poly con paleta crema/sage e inline styles
- Juego Tirachinas: control de pinza proximal con Matter.js
- Juego Avión: flexo-extensión distal con Three.js
- Juego Agua: pronosupinación con sistema de partículas Three.js
- Sistema de telemetría frame-by-frame con BiomechanicsDSP
- Dashboard clínico con gauges de métricas por juego
- Página de calibración `/tracker` con visualización de landmarks
- Test Mode: secuencia automática Tirachinas → Avión → Agua → Dashboard
- Input Observer pattern con HandPinchProvider y MouseInput fallback
- Suavizado EMA α=0.55 con detección de foreshortening
- Documentación completa: README, ADRs, métricas clínicas, privacidad

---

## [0.1.0] — MVP inicial

Versión de validación clínica con los tres juegos implementados y pipeline de telemetría completo.
