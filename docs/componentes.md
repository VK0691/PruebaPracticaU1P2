# Fase 2 · Inventario de componentes (Atomic Design) · Caso IHC-06

**Responsable:** Bryan Guatemal · **Revisora:** Karen Molina

## Átomos

| Componente | Estados | Requisito | En el código |
|---|---|---|---|
| Botón primario / secundario / de texto | normal · foco · deshabilitado durante el envío | R1, R4 | `.boton--primario`, `.boton--secundario`, `.boton--texto` |
| Campo de texto (cédula, código) | normal · foco · inválido (`aria-invalid`) | R2, R3 | `#cedula`, `#codigo` |
| Etiqueta y texto de ayuda | — | R3 | `.etiqueta`, `.ayuda` |
| Mensaje de error | oculto · visible | R3 | `mostrarError()` → `.mensaje-error` |
| Indicador de conexión | En línea · Sin conexión (`role="status"`) | R2 | `#indicador-red`, `actualizarIndicador()` |
| Contador de segundos | 0 … 12 s | R1 | `#segundos`, `iniciarContador()` |
| Insignia de estado | v1: Sin responder · ✓ Guardada · ✓ Confirmada. v2: Sin responder · ⏳ Pendiente de envío · ✓ Confirmada | R5 | `.insignia`, `.insignia--pendiente` (v2) |
| Nota «se guarda en este teléfono» | — | R2 | `.guardado-local` |

## Moléculas

| Componente | Formado por | Estados | Requisito | En el código |
|---|---|---|---|---|
| Campo con etiqueta, ayuda y error | etiqueta + ayuda + error + campo | normal · error | R3 | `.campo`, `.campo--error` |
| Opción de respuesta (radio grande) | radio + texto | normal · elegida · foco | R2 | `.opcion` |
| Bloque de carga | spinner + texto + segundos + «Detener» | visible durante la espera | R1 | `htmlCargando()` |
| Tarjeta SMS | remitente + texto + código | — | R2 | `.sms` |
| Lista de datos de la cita | término + valor | — | R5, R6 | `detalleCita()` |

## Organismos

| Componente | Estados | Requisito | En el código |
|---|---|---|---|
| Cabecera + pestañas | pestaña activa | R2 | `.cabecera`, `.menu`, `marcarMenu()` |
| Formulario de identificación | vacío · con errores · buscando · fallo | R1, R2, R3 | `VISTAS.identificacion` |
| Formulario de respuesta | sin elegir · enviando · pendiente | R1, R2, R4 | `VISTAS.cita` |
| Aviso de envío fallido (v1) | ✓ guardada + «Reintentar» (sin foco ni anuncio) | R3 | `enviarRespuesta()` (catch) en v1 |
| **Bloque de reintento accesible (v2)** | esperando (cuenta regresiva) · pausado · reintentando · intentos agotados (+ alternativa SMS) | R3, R7 | `htmlReintento()`, `pintarReintento()`, `programarReintento()`, `ejecutar()` |
| Comprobante | Asistencia confirmada · Turno liberado | R6 | `VISTAS.comprobante` |
| Tarjeta de estado de la cita | Confirmada · Pendiente · Sin responder | R5 | `VISTAS.estado` |
| Panel del observador + red simulada | oculto · visible (F2) | Fase 4 | `observador.js`, `Observador.agregarControl` |

## Plantillas y páginas

| Plantilla | Páginas |
|---|---|
| Formulario móvil: título + campos + zona de estado + botones de ancho completo | 2.1 Buscar mi cita · 2.2 Detalle y respuesta |
| Resultado: bloque de éxito + datos + acciones | 2.3 Comprobante |
| Tarjeta de estado | 3.0 Estado de mi cita · 1.0 Inicio (aviso) |

## Reglas que seguimos (G2)

1. Si se repite, es componente: el mismo bloque de reintento sirve para «buscar» y para «responder».
2. Un nombre, una función: «Guardada» (v1) se eliminó en v2 porque se confundía con «Confirmada».
3. Cada componente se justifica con un requisito.
4. La zona de estado (`#zona-estado`) está siempre en el mismo lugar: debajo del formulario y encima de los botones.
