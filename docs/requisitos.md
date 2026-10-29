# Fase 2 · Requisitos observables · Caso IHC-06

**Responsable:** Bryan Guatemal · **Revisor:** Carlos Bejarano
**Actor:** Rosa, paciente con conexión intermitente · **Tarea:** confirmar una cita y consultar su estado

**Regla (G2):** un requisito, un verbo. Cada requisito tiene un **criterio observable** que cualquiera puede comprobar en el prototipo.

| ID | Rosa debe poder… | Verbo | Criterio observable (cómo se comprueba) | Origen |
|---|---|---|---|---|
| **R1** | Ver que el sistema está trabajando, cuánto lleva y hasta cuándo esperar | Ver | Toda espera muestra «Buscando…» o «Enviando…» con `role="status"`, los segundos que lleva y el máximo (12 s). A los 12 s la espera **siempre** termina en un mensaje; hay un botón «Detener». Se prueba con la red «Servidor no responde». | **Fallo IHC-06** · HZ-1 |
| **R2** | Conservar lo que escribió y su respuesta aunque se corte la señal | Conservar | La cédula, el código, la cita descargada y la respuesta se guardan en el teléfono (`localStorage`) a cada cambio. Recargar o cerrar la pestaña no borra nada. Un indicador muestra «En línea» o «Sin conexión». | **Restricción** · HZ-2 |
| **R3** | Recuperarse de un fallo de red | Recuperarse | Si la red falla, aparece el motivo en palabras simples («Se perdió la conexión…», «El servidor tardó más de 12 segundos…») y «Reintentar», con los datos intactos | HZ-3 |
| **R4** | Enviar su respuesta una sola vez | Enviar | Durante el envío el botón se bloquea. Cada respuesta lleva una clave única y, si llega dos veces, el servidor devuelve la misma confirmación (mismo código CF-XXXX). | H5 · HZ-2 |
| **R5** | Consultar el estado de su cita y distinguir si está confirmada o solo guardada | Consultar | «Estado de mi cita» muestra uno de tres estados con texto propio: **Confirmada** (con la hora en que el centro de salud la recibió), **Pendiente de envío** (aún no confirmada) o **Sin responder**, más la hora de la última comprobación | MV2 · HZ-3 |
| **R6** | Ver el comprobante aunque no tenga señal | Ver | El comprobante (código, fecha, lugar y hora de recepción) se guarda en el teléfono y se abre con la red en «Sin conexión» | T8 |
| **R7** | Reintentar de forma accesible | Reintentar | Tras un fallo aparece un bloque que **recibe el foco** y se anuncia por el lector: motivo, «su respuesta está guardada pero NO confirmada», «Reintentar ahora», reintento automático (15 / 30 / 60 s) con **«Pausar»**, reintento al volver la señal y alternativa por SMS. Todo con teclado. | **Incidencia sorpresa** (Fase 5 · Issue #5) |

## Lo que no es requisito y por qué existe

| Elemento | Justificación |
|---|---|
| «Volver sin responder» y «Detener» | Son salidas del usuario (H3, control y libertad), no tareas que Rosa quiera lograr |
| Mensaje SMS en el inicio | Es el punto de partida simulado de la tarea (T1); el prototipo no envía SMS reales |
| Panel del observador y «Red simulada» | Herramientas de la prueba para provocar cortes de red de forma controlada; el participante no las ve |

## Uso en los demás productos

Los mismos R1–R7 se usan en el sitemap, el user flow, los componentes, los wireframes (marcas) y el código (`app.js`). Ver [`trazabilidad.md`](trazabilidad.md).
