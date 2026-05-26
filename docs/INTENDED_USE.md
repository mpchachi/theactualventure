# Uso Previsto

## Descripción del producto

FlappyVaina es una plataforma de **entrenamiento y telemonitorización** para pacientes en proceso de rehabilitación neuromotora, principalmente post-ictus. Consiste en tres mini-juegos web controlados mediante visión por computador que capturan métricas de movimiento de la mano (rango de movimiento, fuerza de pinza, pronosupinación, suavidad del gesto).

El producto está orientado a:

- **Pacientes** que realizan ejercicios de rehabilitación de la mano en domicilio o en clínica.
- **Terapeutas ocupacionales y fisioterapeutas** que monitorizan la evolución del paciente a distancia mediante el dashboard de métricas.

---

## Declaración de limitaciones clínicas

> **FlappyVaina no es un producto sanitario ni un dispositivo médico** en el sentido del Reglamento (UE) 2017/745 (MDR) ni de ninguna regulación equivalente. No ha sido evaluado clínicamente para diagnóstico, pronóstico ni toma de decisiones terapéuticas.

Las métricas que genera la plataforma (rango de movimiento estimado, índice de fatiga, jerk) son **indicadores orientativos** derivados de landmarks de visión por computador. Están sujetas a:

- Error de estimación del modelo MediaPipe.
- Variabilidad por condiciones de iluminación, posición de la cámara y oclusiones.
- Ausencia de calibración biomecánica individualizada por paciente.

**El terapeuta mantiene en todo momento el juicio clínico independiente.** Las métricas de esta plataforma complementan, pero nunca sustituyen, la evaluación clínica presencial ni las escalas validadas (Fugl-Meyer, Box and Block, etc.).

---

## Usuarios previstos

| Perfil | Requisitos |
|---|---|
| Paciente | Capacidad de usar un navegador web; acceso a webcam; supervisión terapeuta para configuración inicial |
| Terapeuta | Formación en rehabilitación neuromotora; comprensión básica de métricas de ROM y espasticidad |
| Desarrollador | Ver [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## Entorno de uso previsto

- Navegador web moderno (Chrome 112+ / Edge 112+) en ordenador de sobremesa o portátil.
- Conexión a internet solo necesaria para carga inicial del modelo de visión.
- No apto para uso en dispositivos móviles en versión MVP (cámara frontal presenta ángulo inadecuado).

---

## Fuera de alcance (MVP)

- Diagnóstico clínico de ningún tipo.
- Prescripción o modificación de tratamiento.
- Uso en pacientes con deterioro cognitivo severo sin supervisión directa.
- Uso en menores sin consentimiento del tutor legal.
- Almacenamiento o transmisión de datos de salud identificados (ver [PRIVACY.md](PRIVACY.md)).
