# Fase 3 · Decisiones de prototipado · Caso IHC-05

**Responsable:** Karen Molina · **Revisor:** Bryan Guatemal

## 1. Técnica elegida: prototipo en código (HTML, CSS y JavaScript)

G3 presenta cinco técnicas. Elegimos según la pregunta que queremos responder con la prueba, no según la herramienta.

| Técnica | ¿Sirve para el riesgo de IHC-05? | Por qué |
|---|---|---|
| Papel | No | No permite probar el foco del teclado, el contraste real ni lo que anuncia un lector de pantalla. El fallo de la tarjeta (mensaje no asociado al campo) es justo algo que el papel no muestra. |
| Clic a clic (Figma) | Parcial | Muestra la navegación, pero no `aria-describedby`, `aria-invalid` ni el orden real del Tab. Además, el lector de pantalla no lee un prototipo de Figma. |
| Mago de Oz | No | El riesgo no es una función «inteligente» difícil de construir, sino la interacción accesible. |
| Storyboard | Solo como apoyo | Sirve para contar el contexto de Luis, pero no para probar la tarea. |
| **Código** | **Sí** | Da estados reales (carga, error, éxito), foco y teclado reales, contraste medible, atributos ARIA verificables con un lector y versionado en Git (v1 → v2). |

**Riesgo del caso:** que Luis no pueda terminar la reserva por un error que no ve ni oye. Solo el código prueba ese riesgo con un usuario de teclado y con zoom.

## 2. Fidelidad y profundidad

| Eje (G3) | Nivel | Explicación |
|---|---|---|
| Visual | Alta | Los colores y tamaños son los definitivos, porque el contraste es parte de la restricción y se mide (tabla abajo). |
| Contenido | Alta | Textos reales: los mensajes de error son lo que se prueba. |
| Interacción | Alta en la tarea; nula fuera de ella | El flujo de reservar está completo, con validación, carga, error, éxito, cancelar y reprogramar. El inicio de sesión y el envío del SMS no existen. |
| Alcance | **Vertical** | Una tarea completa y profunda, no todo el portal (G3, prototipo horizontal o vertical) |
| Vida útil | **Desechable** | El servidor y los horarios son simulados. Se reutilizan los textos, las decisiones y los hallazgos. |

**Qué está simulado (no es real):** el registro de la cita, los horarios ocupados (se calculan siempre igual para la misma fecha y médico), el SMS de recordatorio y el error del sistema (`?fallo=una`). Nada se envía a internet. Los datos se guardan en el navegador (`sessionStorage` para el borrador y `localStorage` para las citas).

## 3. Registro de decisiones

| N.º | Decisión | Alternativa descartada | Motivo | Heurística / requisito |
|---|---|---|---|---|
| D1 | Prototipo en HTML, CSS y JS sin librerías | Figma | Ver punto 1. Se abre con doble clic, sin instalar nada. | — |
| D2 | El error de fecha va debajo de la etiqueta, con `aria-describedby`, `aria-invalid` y el foco en el campo | Solo borde rojo o alerta general arriba | Es el fallo de la tarjeta. El texto dice la causa y la corrección. | H9 · R4 |
| D3 | Resumen de errores arriba, con enlaces al campo | Solo el mensaje en el campo | Con la página ampliada, Luis puede no ver el campo; el resumen sí queda a la vista | H9 · R4 |
| D4 | Validar la fecha al completarla (evento `change`), no a cada tecla | Validar mientras escribe | Al escribir el año, el navegador entrega fechas como 0002; validar ahí mostraría errores falsos | H5 |
| D5 | Base de 20 px, botones A / A+ / A++ y modo «Contraste máximo» | Depender del zoom del navegador | Luis no sabe usar Ctrl + «+»; los botones están a la vista y se recuerdan | R3 |
| D6 | Anillo de foco negro de 3 px con borde amarillo | El contorno del navegador | Se ve en fondo blanco y en fondo negro | R2 · WCAG 2.4.7 |
| D7 | Al cambiar de pantalla, el foco va al título `h1` | Dejar el foco donde estaba | El lector anuncia la pantalla nueva y Tab sigue desde arriba | R2 |
| D8 | Borrador en `sessionStorage`; «Cambiar» vuelve al paso con todo puesto | Formulario que se vacía | Es el problema de la variante C: pérdida de datos | H3 · R5 |
| D9 | «Confirmar cita» se bloquea y muestra «Registrando su cita…» con `role="status"` | Ruedita sola | Evita la doble reserva y quita la incertidumbre | H1 · R6 |
| D10 | Diálogo nativo `<dialog>` para cancelar; el foco empieza en la opción segura y Esc la elige | `confirm()` del navegador | Accesible, con textos claros y sin bloquear la página | H3 |
| D11 | **v2:** horarios grandes con «Disponible» / «Ocupado» en texto y tachado | Gris claro (v1) | Lo ocupado se distinguía solo por color (1.9:1). Ver Issue #4. | H4 · R3 · WCAG 1.4.1 |
| D12 | **v2:** la ayuda dice qué días se atiende, el calendario tiene `min` y `max` y el error propone la fecha válida más cercana | Solo el mensaje de error | Prevenir el error es mejor que explicarlo | H5 · R4 |
| D13 | **v2 (incidencia):** reprogramar en una pantalla propia que conserva especialidad, médico y lugar y guarda la nueva selección en un borrador aparte | Cancelar y reservar de nuevo | Es lo que pide la incidencia sorpresa. Además, el borrador aparte no pisa una reserva a medias. | H3 · R7 |
| D14 | Panel del observador oculto (F2) que mide tiempo, errores y pausas | Cronómetro a mano | Medición real y comparable entre v1 y v2. El participante no lo ve. | Fase 4 |

## 4. Contraste medido (medición real)

Calculado con la fórmula de luminancia relativa de WCAG 2.x. Meta del equipo: ≥ 7:1 para texto (nivel AAA).

| Elemento | Colores | Contraste |
|---|---|---|
| Texto principal | `#111111` sobre `#ffffff` | 18.9:1 |
| Texto de ayuda | `#333333` sobre `#ffffff` | 12.6:1 |
| Botón primario (texto blanco) | `#ffffff` sobre `#0b3d91` | 10.0:1 |
| Enlaces y botón secundario | `#0b3d91` sobre `#ffffff` | 10.0:1 |
| Mensaje de error | `#a3001b` sobre `#ffffff` | 8.2:1 |
| Mensaje de error sobre fondo rosado | `#a3001b` sobre `#fff1f2` | 7.4:1 |
| Éxito | `#0a5c27` sobre `#eefaf2` | 7.6:1 |
| Borde de los campos | `#4a4a4a` sobre `#ffffff` | 8.9:1 |
| Contraste máximo: texto | `#ffffff` sobre `#000000` | 21.0:1 |
| Contraste máximo: botones | `#ffe600` sobre `#000000` | 16.6:1 |
| **v1** horario ocupado (texto gris) | `#b5b5b5` sobre `#f4f4f4` | **1.9:1** |
| **v1** fondo ocupado frente a disponible | `#f4f4f4` frente a `#ffffff` | **1.1:1** |
| **v2** horario ocupado (texto) | `#333333` sobre `#f2f4f8` | 11.5:1 |

> Nota para la defensa: WCAG exime de contraste mínimo a los controles inactivos (los horarios ocupados lo son). Aun así, para una persona con visión reducida el problema de uso existe: no distingue cuáles puede elegir. Por eso v2 agrega texto («Ocupado») y tachado, y no depende solo del color (WCAG 1.4.1).
