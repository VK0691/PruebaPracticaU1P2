# Fase 2 · Sitemap, navegación y user flow · Caso IHC-06

**Responsable:** Bryan Guatemal · **Revisora:** Karen Molina

## 1. Sitemap

![Sitemap](../diagramas/sitemap.png)

Fuente editable: [`diagramas/sitemap.html`](../diagramas/sitemap.html). Tres secciones a un toque desde cualquier pantalla (pestañas fijas): **Inicio**, **Mi cita** y **Estado**. Es un sitemap plano a propósito: con señal débil, cada pantalla extra es una carga más.

## 2. Tabla de navegación

| # | De | A | Con qué elemento | Paso del user flow | Regla que cumple |
|---|---|---|---|---|---|
| 1 | Cualquier pantalla | 1.0 / 2.x / 3.0 | Pestañas Inicio · Mi cita · Estado; la activa tiene `aria-current="page"` | Todo el recorrido | H1, H4 |
| 2 | 1.0 Inicio | 2.1 Buscar o 2.2 Detalle | «Confirmar mi cita». Si la cita ya está guardada en el teléfono, va directo al detalle. | ¿La cita ya está guardada? | R2 |
| 3 | 2.1 Buscar | Se queda | Mensaje bajo el campo (cédula o código) | ¿Datos con formato válido? → No | H9 |
| 4 | 2.1 Buscar | Se queda | Estado «Buscando…» → error de red con «Reintentar» (v2: bloque de reintento accesible) | ¿Respondió a tiempo? → No | H1, H9, R1, R3 |
| 5 | 2.1 Buscar | 2.2 Detalle | Respuesta correcta del servidor | ¿Cita encontrada? → Sí | R1 |
| 6 | 2.2 Detalle | 1.0 Inicio | «Volver sin responder» (la respuesta elegida queda guardada) | Salida | H3, R2 |
| 7 | 2.2 Detalle | 2.3 Comprobante | «Enviar mi respuesta» → «Enviando…» → recibido | ¿Lo recibió? → Sí | R1, R4 |
| 8 | 2.2 Detalle | Se queda | Fallo → «Pendiente de envío» + Reintentar (v2: automático, pausar, al volver la señal) | ¿Lo recibió? → No | R3, R7 |
| 9 | 2.x | Se queda | «Detener» durante una espera | Salida de la espera | H3 |
| 10 | 2.3 Comprobante | 3.0 Estado | «Ver estado de mi cita» | Cierre de la tarea | R5 |
| 11 | 3.0 Estado | 2.2 Detalle | «Responder ahora» (si está sin responder) | — | R5 |
| 12 | 3.0 Estado | Se queda | «Actualizar estado» o «Enviar ahora mi respuesta» (v2, si está pendiente) | — | R5, R7 |

### Adónde regresa el usuario

- Tras **enviar con éxito**: al comprobante, con el foco en el título «Asistencia confirmada».
- Tras un **fallo**: se queda en la misma pantalla con su respuesta guardada. En v2 el foco va al bloque de reintento.
- Si **sale y vuelve** con una respuesta pendiente: el inicio muestra el aviso «pendiente de envío» y el reintento sigue programado (v2).
- Si **recarga la página**: vuelve a la misma pantalla con todo lo escrito.

### Comprobación (G2)

- [x] Cada flecha del user flow que cambia de pantalla tiene un elemento que la hace posible.
- [x] Se puede salir de cada pantalla y de cada espera («Detener»).
- [x] El usuario sabe dónde está (pestaña activa, título con foco) y en qué estado está la red (indicador).
- [x] Los nombres de las pestañas coinciden con los títulos de las pantallas.

## 3. User flow con éxito y error recuperable

![User flow](../diagramas/user-flow.png)

Fuente editable (Mermaid): [`diagramas/user-flow.mmd`](../diagramas/user-flow.mmd)

- **Camino feliz:** SMS → Inicio → Buscar mi cita → Detalle → Enviar respuesta → Comprobante → Estado: Confirmada.
- **Errores recuperables:**
  - **Formato inválido:** mensaje bajo el campo.
  - **Red caída o servidor sin respuesta:** la espera termina a los 12 s con el motivo y «Reintentar».
  - **Cita no encontrada:** se pide revisar el SMS.
  - **Respuesta no enviada:** queda «Pendiente de envío», guardada en el teléfono, y se reintenta sin volver a escribir nada.
