# Fase 2 · Requisitos observables · Caso IHC-05

**Responsable:** Bryan Guatemal · **Revisor:** Carlos Bejarano
**Actor:** Luis, adulto mayor con visión reducida · **Tarea:** reservar cita de especialidad

**Regla (G2):** un requisito, un verbo. Se redacta desde el usuario y se numera para seguirlo hasta el wireframe y el código. Cada requisito tiene un **criterio observable**: algo que cualquiera puede comprobar en el prototipo.

| ID | Luis debe poder… | Verbo | Criterio observable (cómo se comprueba) | Origen |
|---|---|---|---|---|
| **R1** | Reservar una cita de especialidad en 3 pasos, sabiendo siempre en qué paso está | Reservar | Las pantallas de reserva muestran «Paso X de 3» con el paso actual marcado (`aria-current="step"`). La tarea termina en el comprobante después de 3 pantallas. | Tarea crítica |
| **R2** | Recorrer todo el flujo solo con el teclado, viendo dónde está el foco | Recorrer | Con Tab, Mayús+Tab, flechas, Espacio y Enter se completa la reserva sin mouse. El foco tiene un anillo de 3 px negro con borde amarillo y contraste ≥ 3:1. Al cambiar de pantalla, el foco va al título. | Restricción · HZ-2 |
| **R3** | Leer todos los textos con alto contraste y agrandar la letra | Leer | Todo el texto tiene contraste ≥ 7:1 (medido; tabla en `decisiones.md`). Los botones A / A+ / A++ cambian la letra a 100 / 125 / 150 % y «Contraste máximo» pasa a amarillo y blanco sobre negro. Con zoom del 200 % no se pierde contenido. | Restricción · HZ-2 |
| **R4** | Entender por qué una fecha no es válida y cómo corregirla | Entender | Al elegir una fecha inválida aparece, debajo de la etiqueta, un mensaje con la causa y la corrección. El campo queda con `aria-invalid="true"` y `aria-describedby` apunta al mensaje, así que el lector lo lee al enfocarlo. El resumen de errores enlaza al campo. | **Fallo IHC-05** · HZ-1 |
| **R5** | Conservar lo que ya eligió al volver, al cambiar un dato, al cancelar o si hay un error | Conservar | Desde el resumen, «Cambiar fecha» abre el paso 2 con la fecha y la hora puestas. Recargar la página no borra el borrador. «Cancelar reserva» pregunta antes y guarda lo elegido. Tras un error del sistema los datos siguen ahí. | Problema de la variante C · HZ-3 |
| **R6** | Confirmar la cita y ver que quedó registrada | Confirmar | Antes de confirmar se ve un resumen editable. Al pulsar «Confirmar cita», el botón se bloquea y aparece «Registrando su cita…» (`role="status"`). Después aparece el comprobante con el código CC-XXXX y la opción de imprimirlo. | MV2 · HZ-3 |
| **R7** | Reprogramar su cita sin perder la selección previa | Reprogramar | En «Mis citas», «Reprogramar» mantiene especialidad, médico y lugar, y solo pide la fecha y la hora nuevas. Si sale o hay un error, al volver encuentra lo que eligió. La cita original no cambia hasta confirmar. | **Incidencia sorpresa** (Fase 5 · Issue #5) |

## Lo que no es requisito y por qué existe

| Elemento | Justificación |
|---|---|
| Botón «Cancelar reserva» y su diálogo | Es la salida del usuario (H3, control y libertad), no una tarea que Luis quiera lograr. Igual que en G2, aparece en la navegación y los componentes, no como requisito aparte. |
| Inicio de sesión | Queda fuera de alcance: se supone que Luis ya entró. El prototipo es vertical y se concentra en reservar. |
| «Mis citas» y «Cancelar cita» | Dan contexto y son la puerta de entrada a R7 |

## Uso en los demás productos

Los mismos R1–R7 se usan en el sitemap (pantalla donde ocurre cada uno), el user flow (paso), los componentes (pieza que lo cubre), los wireframes (marca dentro del cuadro) y el código (función de `app.js`). Ver [`trazabilidad.md`](trazabilidad.md).
