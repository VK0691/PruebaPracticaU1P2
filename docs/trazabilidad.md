# Fase 2 · Matriz de trazabilidad · Caso IHC-05

**Responsable:** Bryan Guatemal · **Revisor:** Mario Solis

**Pregunta que responde:** ¿algún requisito se perdió en el camino de la idea al código? Se lee por filas: requisito → pantalla → flujo → componente → wireframe → prototipo → evidencia.

## Matriz requisito → pantalla → flujo → componente → wireframe

| Requisito | Pantalla (sitemap) | Paso del user flow | Componentes | Wireframe | Prototipo (dónde se prueba) | Issue | Evidencia |
|---|---|---|---|---|---|---|---|
| **R1** Reservar en 3 pasos sabiendo dónde está | 1.0 → 2.1 → 2.2 → 2.3 → 2.4 | Camino feliz completo | Indicador de pasos · Botón primario · Opción grande | Cuadros 1 y 2 (marcas C, B) | `pasos(n)`, `VISTAS['paso-1'..'paso-3']` | — | `evidencias/v1-05-paso3-resumen.png` |
| **R2** Recorrer todo con teclado y foco visible | Todas | Todo el recorrido | Anillo de foco · Diálogo (Esc) · el foco va al título al cambiar de pantalla | Cuadro 1 (D), cuadro 4 (C) | `:focus-visible`, `render()` enfoca el `h1`, `preguntar()` | #2 | Prueba con teclado en `pruebas/sesion.md` |
| **R3** Leer con alto contraste y letra grande | Todas | Todo el recorrido | Ajustes de lectura · Tarjeta de horario con texto (v2) | Cuadros 1–4 (A), cuadro 2 (D) | `aplicarAjustes()`, `body.contraste-max`, `.hora` | #2, #4 | `evidencias/v2-12-letra-grande-contraste.png`, `comparacion-v1-v2-horarios.png` |
| **R4** Entender por qué la fecha no es válida | 2.2 Paso 2 (estado de error) | ¿Fecha válida? → No | Campo con etiqueta, ayuda y error · Resumen de errores · Sugerencia de fecha (v2) | Cuadro 3 (B, C, D) | `validarFecha()`, `mostrarError()` (`aria-invalid` + `aria-describedby`) | **#1** | `evidencias/v1-03-paso2-error-fecha.png`, `comparacion-v1-v2-error-fecha.png` |
| **R5** Conservar lo elegido | 1.0 (aviso), 2.1–2.3, 3.2 | «Cambiar», «Volver», error del sistema, cancelar | Fila de resumen con «Cambiar» · Diálogo · borrador en `sessionStorage` | Cuadro 1 (B), cuadro 3 (E) | `guardarReserva()`, `rutaContinuar()`, `?volver=resumen` | #3 | `evidencias/v1-08-error-sistema.png` |
| **R6** Confirmar y ver que quedó registrada | 2.3 → 2.4 | Confirmar → ¿respondió? → Comprobante | Bloque de estado del envío · Comprobante · Botón bloqueado | Cuadro 4 (B, C, D, E) | `confirmarCita()` / `enviarAlSistema()`, `VISTAS.comprobante` | #3 | `evidencias/v1-06-registrando.png`, `v1-07-comprobante.png` |
| **R7** Reprogramar sin perder la selección (v2) | 3.0 → 3.2 → 2.4 | Rama de la incidencia | Selector de fecha y horario reutilizado · Tarjeta «Su hora actual» · borrador `reprog` | Usa la plantilla del cuadro 2 | `VISTAS.reprogramar`, `guardarReprog()` | **#5** | `evidencias/v2-10-reprogramar.png`, `v2-11-reprogramada.png` |

## Elementos que no son requisito

| Elemento | Dónde | Justificación |
|---|---|---|
| «Cancelar reserva» + diálogo | Navegación #12, cuadros 2 y 3 | Salida del usuario (H3) |
| Panel del observador (F2) | Todas, oculto | Herramienta de la Fase 4 para medir tiempo, errores y pausas reales. El participante no la ve. |
| «Cancelar cita» en Mis citas | 3.0 | Contexto del sistema; en v2 el diálogo sugiere «Reprogramar» si solo quiere cambiar el día |

## Cobertura por wireframe

| Cuadro | Archivo | Momento del flujo | Requisitos |
|---|---|---|---|
| 1 | `wireframes/01-inicio.png` | 1.0 Inicio | R1, R2, R3, R5 |
| 2 | `wireframes/02-formulario.png` | 2.2 Paso 2 | R1, R3, R4, R5 |
| 3 | `wireframes/03-error.png` | 2.2, rama de error | R4, R5 |
| 4 | `wireframes/04-confirmacion.png` | 2.3 → 2.4 | R2, R6 |

> Los wireframes muestran el diseño final (incluye los cambios de v2: horarios con texto y sugerencia de fecha). La primera iteración se ve en las capturas `evidencias/v1-*.png`.

## Comprobación (prueba de fuego de G2)

- [x] Ninguna celda vacía: cada requisito tiene pantalla, flujo, componente, wireframe y código.
- [x] Cada cuadro de wireframe corresponde a al menos un requisito.
- [x] Cada nodo del user flow tiene su pantalla o estado en el prototipo.
- [x] Los nombres son iguales en el sitemap, el menú y los títulos.
