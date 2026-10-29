# Fase 2 · Matriz de trazabilidad · Caso IHC-06

**Responsable:** Bryan Guatemal · **Revisor:** Mario Solis

Se lee por filas: requisito → pantalla → flujo → componente → wireframe → prototipo → evidencia.

| Requisito | Pantalla (sitemap) | Paso del user flow | Componentes | Wireframe | Prototipo (dónde se prueba) | Issue | Evidencia |
|---|---|---|---|---|---|---|---|
| **R1** Ver progreso y límite de espera | 2.1, 2.2, 3.0 | Buscando… / Enviando… → ¿respondió a tiempo? | Bloque de carga · contador de segundos · «Detener» | Cuadro 2 (C) | `solicitar()` (límite de 12 s), `htmlCargando()`, `iniciarContador()` | **#1** | `evidencias/v1-03-cargando-con-limite.png`, `v1-04-tiempo-agotado.png` |
| **R2** Conservar la información | Todas | Lo escrito se guarda a cada tecla; recarga | Nota «se guarda en este teléfono» · indicador de conexión | Cuadros 1 (A), 2 (A, B) | `guardar()` en cada `input` y `change`; `datos` en `localStorage` | #2 | Recargar a mitad de la tarea (ver `pruebas/sesion.md`) |
| **R3** Recuperarse de un fallo de red | 2.1, 2.2 | Rama «No» de ¿respondió? / ¿lo recibió? | Mensaje con motivo · «Reintentar» | Cuadro 3 (B, F) | `MOTIVOS`, `buscarCita()` y `enviarRespuesta()` (v1), `ejecutar()` (v2) | #3 | `evidencias/v1-05-envio-fallido.png` |
| **R4** Enviar una sola vez | 2.2 | Enviar → botón bloqueado | Botón deshabilitado · clave única | Cuadro 3 (D) | `datos.pendiente.clave`, `atender('responder')` idempotente | #2 | Pulsar varias veces: el código CF no cambia |
| **R5** Consultar el estado y distinguirlo | 3.0, 1.0 (aviso) | Comprobante → Estado: Confirmada | Insignias de estado · hora de la última comprobación | Cuadros 1 (B), 4 (C, E) | `VISTAS.estado` | **#4** | `evidencias/comparacion-v1-v2-estado.png` |
| **R6** Ver el comprobante sin conexión | 2.3 | Comprobante | Comprobante guardado | Cuadro 4 (D) | `VISTAS.comprobante` (lee `datos.confirmacion` local) | — | `evidencias/v2-07-comprobante.png` |
| **R7** Reintentar de forma accesible (v2) | 2.2, 3.0 | Pendiente → reintento manual o automático | Bloque de reintento accesible | Cuadro 3 (B–F) | `htmlReintento()`, `pintarReintento()`, `programarReintento()`, evento `online` | **#5** | `evidencias/v2-05-envio-fallido.png`, `comparacion-v1-v2-envio-fallido.png` |

## Elementos que no son requisito

| Elemento | Justificación |
|---|---|
| «Volver sin responder», «Detener» | Salidas del usuario (H3) |
| Tarjeta SMS en el inicio | Punto de partida simulado de la tarea |
| Panel del observador con «Red simulada» | Herramienta de la Fase 4 para provocar cortes de red; el participante no la ve |

## Cobertura por wireframe

| Cuadro | Archivo | Momento del flujo | Requisitos |
|---|---|---|---|
| 1 | `wireframes/01-inicio.png` | 1.0 Inicio | R1, R2, R5 |
| 2 | `wireframes/02-formulario.png` | 2.1 Buscar mi cita (buscando) | R1, R2 |
| 3 | `wireframes/03-error.png` | 2.2, rama «No la recibió» | R3, R4, R7 |
| 4 | `wireframes/04-confirmacion.png` | 2.3 → 3.0 | R5, R6 |

> Los wireframes muestran el diseño final (incluye el reintento accesible de v2). La primera iteración se ve en `evidencias/v1-*.png`.

## Comprobación (G2)

- [x] Ninguna celda vacía.
- [x] Cada cuadro corresponde a al menos un requisito.
- [x] Cada nodo del user flow tiene su pantalla o estado en el prototipo.
- [x] Los nombres coinciden entre el sitemap, las pestañas y los títulos.
