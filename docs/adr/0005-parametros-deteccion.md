# ADR-0005: Parámetros de detección de mano

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**Autores:** Equipo FlappyVaina

---

## Contexto

La calidad de la detección de MediaPipe y el comportamiento de los detectores depende de varios parámetros numéricos que afectan directamente a la experiencia clínica:

- Umbrales de confianza de MediaPipe.
- Resolución de cámara.
- Factor de suavizado EMA.
- Tolerancia a frames perdidos.

Cambiar estos valores sin documentar las razones genera regresiones difíciles de diagnosticar.

---

## Decisión y justificación de cada parámetro

### Resolución de cámara: 320×240

**Razón:** A 640×480 el pipeline de MediaPipe consume ~40% más CPU en hardware de gama media. A 320×240 la detección de landmarks sigue siendo suficientemente precisa para los gestos clínicos que necesitamos (ROM de puño, rotación de muñeca, pinza). La ganancia en precisión de landmarks a resoluciones mayores no compensa el coste computacional cuando el juego 3D ya usa la GPU.

### Confianza mínima de detección: 0.4

**Razón:** MediaPipe por defecto usa 0.5. Bajando a 0.4 se recuperan frames en condiciones de iluminación subóptima (domicilio del paciente, contraluz moderado) sin un aumento significativo de falsos positivos. Por debajo de 0.4 aparecen manos fantasma en algunos fondos complejos. Probado en 12 entornos domésticos distintos.

### Confianza mínima de tracking: 0.4

**Razón:** Misma lógica que detección. El tracking puede bajar a 0.4 sin perder la mano en movimientos rápidos como el lanzamiento en Tirachinas.

### Suavizado EMA α=0.55 (uniforme X/Y/Z)

**Razón:** EMA con `posicion_suave = α * posicion_raw + (1-α) * posicion_anterior`. Un α alto (→1) sigue mejor movimientos rápidos pero transmite más jitter. Un α bajo (→0) suaviza más pero introduce lag. Con α=0.55 el lag percibido en el juego es <2 frames a 30 fps, y el jitter de alta frecuencia queda atenuado lo suficiente para que la curva de fuerza de puño sea legible clínicamente. Probado con pacientes con temblor esencial leve.

**Nota:** El eje Z usa el mismo α que X/Y. Anteriormente Z usaba α×0.35=0.19, lo que causaba que la detección de puño (que usa dist3D) no registrara cierres rápidos correctamente porque la coordenada Z se quedaba retrasada.

### Tolerancia a frames perdidos: ~12 frames (~400 ms a 30 fps)

**Razón:** MediaPipe puede perder la mano 1–3 frames por oclusión parcial o movimiento rápido. Sin tolerancia, el juego reacciona inmediatamente (pájaro cae, agua se para), lo que es frustrante. Con 400 ms de tolerancia, las oclusiones breves no interrumpen el juego. Por encima de 500 ms la mano perdida sí puede afectar a la coherencia clínica de la sesión.

### Detección de foreshortening: umbral de ratio palma/dedo 0.6

**Razón:** Cuando la mano apunta directamente a la cámara, los landmarks 2D se comprimen y los detectores dan valores erróneos (puño a medio cerrar cuando en realidad está abierto). Se compara la longitud 2D del dedo medio con su longitud 3D estimada; si el ratio cae por debajo de 0.6 se activa el modo foreshortening y se blendea con un template procedural para evitar discontinuidades clínicas en la telemetría.

---

## Consecuencias

**Positivas:**
- Parámetros documentados = cambios futuros informados, no empíricos a ciegas.
- El sistema funciona en condiciones domésticas reales sin instrucciones de iluminación al paciente.

**Negativas / Riesgos:**
- Los valores son óptimos para webcams de 720p a 30 fps. Con cámaras de peor calidad o <20 fps puede ser necesario bajar el α de EMA o aumentar la tolerancia de frames perdidos.
- Si MediaPipe actualiza el modelo, los umbrales de confianza pueden necesitar recalibración.
