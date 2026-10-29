# Fase 2 · Inventario de componentes (Atomic Design) · Caso IHC-05

**Responsable:** Bryan Guatemal · **Revisora:** Karen Molina

Piezas reutilizables, de átomo a página. Cada una existe porque cubre un requisito (regla 3 de G2). La columna «En el código» dice dónde está cada pieza para poder mostrarla en la defensa.

## Átomos

| Componente | Estados | Requisito | En el código |
|---|---|---|---|
| Botón primario | normal · hover · foco · deshabilitado (durante el envío) | R1, R6 | `.boton--primario` (styles.css) |
| Botón secundario / de texto | normal · foco | H3 (salidas) | `.boton--secundario`, `.boton--texto` |
| Etiqueta (`label` / `legend`) | — | R4 | `.etiqueta`, `legend` |
| Texto de ayuda | — | R4 (v2: días de atención) | `.ayuda`; `ayudaFecha()` en v2 |
| Campo de fecha (`input type="date"`) | normal · foco · inválido (`aria-invalid`) | R4 | `#fecha` |
| Lista desplegable (médico) | habilitada · deshabilitada hasta elegir especialidad | R1 | `#medico` |
| Mensaje de error | oculto · visible | R4 | `mostrarError()` / `limpiarError()` → `.mensaje-error` |
| Indicador de carga (spinner + texto) | visible durante la espera | R6 | `.cargando`, `.spinner` (respeta `prefers-reduced-motion`) |
| Insignia de estado | Confirmada · Confirmada (reprogramada) · Cancelada | R6, R7 | `.insignia` |
| Anillo de foco | visible con teclado | R2 | `:focus-visible` (negro 3 px + amarillo) |

## Moléculas

| Componente | Formado por | Estados | Requisito | En el código |
|---|---|---|---|---|
| Campo con etiqueta, ayuda y error | etiqueta + ayuda + mensaje de error + campo | normal · error | R4 | `.campo` / `.campo--error` |
| Opción grande (radio) | radio + texto + detalle | normal · elegida · foco | R1, R2 | `.opcion` |
| Tarjeta de horario | radio + hora + estado en texto | disponible · ocupado · elegido · hora actual (v2) | R3 (v2), R7 | `htmlHoras()`, `.hora` |
| Indicador de pasos | 3 pastillas | hecho · actual (`aria-current="step"`) · pendiente | R1 | `pasos(n)` |
| Botones de ajuste de lectura | 4 botones con `aria-pressed` | presionado · no presionado | R3 | `.ajustes`, `aplicarAjustes()` |
| Sugerencia de fecha (v2) | botón «Usar el …» | visible · oculta | R4 (H5) | `#sugerencia`, `proximaFecha()` |
| Fila de resumen | término + valor + «Cambiar» | con / sin enlace | R5 | `detalleCita()` |

## Organismos

| Componente | Estados | Requisito | En el código |
|---|---|---|---|
| Encabezado (marca + menú + ajustes) | ítem activo marcado | R2, R3 | `<header class="cabecera">`, `marcarMenu()` |
| Formulario de especialidad y lugar | normal · con errores | R1, R5 | `VISTAS['paso-1']` |
| Selector de fecha y horario | vacío · error de fecha · horarios visibles | R4, R5 | `VISTAS['paso-2']`; en v2 `htmlFormFechaHora()` + `montarFormFechaHora()` |
| Resumen de errores | oculto · visible con enlaces | R4 | `mostrarErrores()` → `.resumen-errores` |
| Resumen de la cita | editable (paso 3) · solo lectura (comprobante) | R5, R6 | `detalleCita(c, conCambiar)` |
| Bloque de estado del envío | cargando · error del sistema | R6 | `confirmarCita()` (v1) / `enviarAlSistema()` (v2) |
| Diálogo de confirmación | cerrado · abierto (Esc = opción segura) | H3 | `<dialog id="dialogo">`, `preguntar()` |
| Panel del observador | oculto · visible (F2) | Fase 4 (medición) | `observador.js` |

## Plantillas y páginas

| Plantilla | Páginas que la usan |
|---|---|
| Paso de formulario: indicador de pasos + título + resumen de errores + formulario + acciones | 2.1 Paso 1 · 2.2 Paso 2 · 3.2 Reprogramar (v2) |
| Resultado: bloque de éxito + resumen de solo lectura + acciones | 2.4 Comprobante · 3.1 Ver comprobante |
| Lista: título + tarjetas | 3.0 Mis citas · 1.0 Inicio |

## Reglas que seguimos (G2)

1. Si se repite, es componente: el campo con error es el mismo en los pasos 1 y 2 y en la reprogramación.
2. Un nombre, una función: «Cambiar» siempre lleva a editar, nunca borra.
3. Cada componente se justifica con un requisito (columna «Requisito»).
4. Consistencia: el botón primario siempre está a la izquierda y es la acción que avanza.
