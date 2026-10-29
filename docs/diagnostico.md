# Fase 1 · Diagnóstico UX · Caso IHC-05

**Responsable:** Carlos Bejarano · **Revisor:** Mario Solis
**Método:** recorrido cognitivo de la tarea crítica y evaluación heurística (Nielsen) hecha por dos integrantes, con severidad de 0 a 4.
**Fuentes de apoyo:** G1 (emoción, touchpoints, momentos de verdad), G2 (requisitos y trazabilidad) y G3 (técnicas de prototipado).

## 1. Tarjeta asignada

| Campo | Valor |
|---|---|
| Código | IHC-05 |
| Variante | C · Citas médicas. Problema inicial: pérdida de datos e incertidumbre al confirmar |
| Persona usuaria | Adulto mayor con visión reducida |
| Contexto | Sistema de citas médicas en una situación realista de uso |
| Tarea crítica | Reservar cita de especialidad |
| Restricción obligatoria | Navegación accesible y alto contraste |
| Fallo adicional | Error de fecha sin mensaje asociado al campo |

## 2. Proto-persona

> **Aclaración:** es una proto-persona construida por el equipo a partir de la tarjeta. No sale de entrevistas, así que sus datos son supuestos de diseño, no hallazgos.

**Luis Alberto Naranjo, 68 años.** Jubilado, vive en Ambato.
- **Visión:** degeneración macular leve y presbicia. Usa lentes, amplía la pantalla al 150–200 % y le cuesta distinguir los grises claros.
- **Experiencia digital:** usa WhatsApp en el celular. Para trámites usa la computadora de la casa y a veces le pide ayuda a su hija.
- **Objetivo:** conseguir una cita de Cardiología, que le ordenó su médico de cabecera, sin hacer fila desde la madrugada.
- **Frustraciones:** letras pequeñas, mensajes que no dicen qué hizo mal y perder lo que ya llenó.
- **Cómo usa la página:** con el teclado (Tab, flechas y Enter), porque el mouse le cuesta cuando la página está ampliada.

## 3. Touchpoints del recorrido actual (antes del rediseño)

Escala emocional de −2 (muy negativa) a +2 (muy positiva), igual que la guía de G1. ★ = momento de verdad.

| N.º | Touchpoint | Canal | Qué hace Luis | Emoción | Por qué | Tipo de dato |
|---|---|---|---|---|---|---|
| T1 | Orden de interconsulta del médico de cabecera | Presencial | Recibe la orden de Cardiología y le dicen que reserve por internet | 0 | Neutral: no sabe si podrá hacerlo solo | Estimación |
| T2 | Página de inicio del portal | Web | Busca dónde reservar | −1 | Texto gris pequeño y poco contraste; tiene que ampliar | Estimación |
| T3 | Identificación con cédula | Web | Escribe su cédula | −1 | El foco del teclado casi no se ve; se pierde en la página | Estimación |
| T4 | Elegir especialidad y médico | Web | Elige Cardiología | 0 | La lista se entiende, aunque es larga | Estimación |
| T5 ★ | Elegir la fecha | Web | Escribe un sábado sin saber que no hay atención | −2 | **Fallo de la tarjeta:** el campo se pinta de rojo y no dice por qué; el lector de pantalla no anuncia nada | Estimación |
| T6 | Elegir el horario | Web | Busca una hora libre | −1 | Las horas ocupadas solo se ven en gris claro | Estimación |
| T7 ★ | Confirmar la reserva | Web | Pulsa «Confirmar» | −2 | Ruedita sin texto; si vuelve atrás para corregir se borra lo elegido y no sabe si la cita quedó registrada | Estimación |
| T8 | Comprobante y recordatorio | Web / SMS | Busca el código de la cita | −1 | El comprobante tiene letra pequeña y no se imprime bien | Estimación |

### Momentos de verdad

| ID | Touchpoint | Por qué decide la experiencia |
|---|---|---|
| MV1 | T5 · Elegir la fecha | Si el error no se explica, Luis no puede seguir. Abandona y va a hacer fila, o culpa su vista («ya no sirvo para esto»). Es la caída más fuerte de la curva. |
| MV2 | T7 · Confirmar | Decide la confianza. Si no queda claro que la cita se registró, llama, va en persona o reserva dos veces. Por la regla pico-final, este cierre es lo que más recordará. |

## 4. Hallazgos (vinculados a las heurísticas de Nielsen)

| ID | Hallazgo | Heurística | Severidad (0–4) | Evidencia | Issue |
|---|---|---|---|---|---|
| HZ-1 | El error de fecha no tiene un mensaje asociado al campo: solo hay un borde rojo. No dice la causa (sábado, feriado, fecha pasada) ni cómo corregirla. | **H9** Ayudar a reconocer, diagnosticar y recuperarse de errores; **H5** Prevención de errores (el calendario deja elegir días sin atención) | **4** · Catastrófico: impide terminar la tarea | Recorrido cognitivo en T5: no hay texto de error, `aria-describedby` ni `aria-invalid`, así que el lector no anuncia nada. Se depende solo del color (WCAG 1.4.1, 3.3.1 y 3.3.3). | #1 |
| HZ-2 | El contraste es bajo, el foco no se ve y los estados se distinguen solo por el color (horas ocupadas en gris). | **H4** Consistencia y estándares (WCAG 2.2: 1.4.3, 1.4.11, 2.4.7) | **3** · Grave | Recorrido en T2, T3 y T6 con la página ampliada al 200 % y solo teclado | #2 |
| HZ-3 | Incertidumbre al confirmar: no hay resumen previo, la espera no tiene texto y al volver atrás se pierde lo elegido. | **H1** Visibilidad del estado del sistema; **H3** Control y libertad del usuario | **3** · Grave | Recorrido en T7: el botón «Atrás» del navegador vacía el formulario y no se muestra un código de cita | #3 |

## 5. Niveles de respuesta emocional (Norman)

| Nivel | Qué vive Luis en el sistema actual | Qué debe lograr el rediseño |
|---|---|---|
| Visceral | Pantalla gris con letra pequeña. Su primera impresión es «esto no es para mí» y se pone tenso. | Letra grande, contraste alto y pocos elementos, para que la primera impresión sea de calma. |
| Conductual | No puede completar la fecha. Lo intenta varias veces sin saber qué corregir y pierde lo elegido al volver. | Un error que dice qué pasó y cómo corregirlo, datos que se conservan y uso completo con teclado. |
| Reflexivo | «Ya no sirvo para estas cosas.» Se culpa, desconfía del hospital y vuelve a la fila presencial. | Que termine con un comprobante claro y la sensación de que pudo hacerlo solo. |

## 6. Curva emocional inicial

![Curva emocional antes](../diagramas/curva-antes.png)

**Justificación:** la curva baja en T5 y T7, que son los momentos de verdad. En T5 la causa es el fallo de la tarjeta (error sin mensaje). En T7 es la incertidumbre al confirmar, que es el problema de la variante C. Ningún punto pasa de 0, porque la restricción de accesibilidad no se cumple en casi ningún paso.

## 7. Medición real frente a estimación

| Dato | Tipo | Cómo se obtuvo |
|---|---|---|
| Emoción por touchpoint (curva inicial) | **Estimación** | Recorrido cognitivo del equipo poniéndose en el lugar de la proto-persona. No hubo usuarios reales en esta fase. |
| Severidad de los hallazgos | **Estimación** | Escala de Nielsen (0–4), con acuerdo entre dos evaluadores |
| Contraste de colores del prototipo | **Medición real** | Fórmula de luminancia relativa de WCAG, calculada para cada par de colores (tabla en `docs/decisiones.md`) |
| Tiempo, errores, pausas y éxito de la tarea | **Medición real (Fase 4)** | Panel del observador del prototipo (`?observador=1`) durante la sesión con un participante de otro grupo. Ver `pruebas/sesion.md`. |
| Curva después | **Estimación hasta la prueba** | Se actualiza con lo observado en la sesión (`diagramas/curvas.csv` → `generar_curvas.py`) |

## 8. Issues abiertos en esta fase

- **#1** Error de fecha sin mensaje asociado al campo (HZ-1)
- **#2** Bajo contraste, foco invisible y estados que dependen solo del color (HZ-2)
- **#3** Incertidumbre al confirmar y pérdida de datos al volver (HZ-3)

El texto listo para copiar en GitHub está en [`docs/issues.md`](issues.md).
