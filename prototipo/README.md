# Prototipo CitaClara · Caso IHC-05 · Cómo ejecutarlo

No necesita instalar nada: es HTML, CSS y JavaScript sin librerías.

## Abrir

- **Opción 1 (la más simple):** doble clic en `v1/index.html` o en `v2/index.html`. Se abre en el navegador (se recomienda Chrome o Edge).
- **Opción 2 (servidor local):** dentro de esta carpeta:
  ```bash
  python -m http.server 8000
  ```
  Luego abrir `http://localhost:8000/v1/` o `http://localhost:8000/v2/`.

## Parámetros para la prueba

| Dirección | Qué hace |
|---|---|
| `index.html?observador=1` | Abre el panel del observador, que mide tiempo, errores y pausas. También se abre y se cierra con **F2**. |
| `index.html?fallo=una` | La primera vez que se confirma, el sistema simula un error (para probar la recuperación) |
| `index.html?fallo=siempre` | El sistema falla siempre al confirmar |

En el panel del observador se puede cambiar el fallo y **borrar los datos del prototipo** para empezar limpio.

## Recorrido de prueba rápido

1. Inicio → «Reservar cita con especialista».
2. Paso 1: pulsar «Continuar» sin elegir nada → se ven los errores. Elegir Cardiología y el Hospital Central.
3. Paso 2: escribir la fecha de un **sábado** y salir del campo → aparece el mensaje junto al campo. En v2 también aparece la sugerencia de fecha.
4. Elegir un día hábil y un horario → Paso 3 → «Cambiar fecha» (lo elegido se conserva) → «Confirmar cita» → comprobante.
5. **Solo v2:** Mis citas → «Reprogramar» → elegir otra fecha → salir a Inicio y volver: la selección sigue.

## Diferencias entre v1 y v2

| | v1 | v2 |
|---|---|---|
| Horarios | Pequeños; los ocupados solo en gris | Grandes, con «Disponible» / «Ocupado» en texto y tachado (Issue #4) |
| Fecha | Mensaje con la causa del error | Además, la ayuda avisa los días de atención, el calendario limita fechas y el error propone la fecha más cercana (Issue #1) |
| Reprogramar | No existe | Conserva especialidad, médico y lugar, y no pierde la selección nueva (Issue #5, incidencia) |

Lo que está simulado: el registro en el servidor, los horarios ocupados y el SMS. Los datos se guardan solo en el navegador.
