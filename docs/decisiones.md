# Fase 3 · Decisiones de prototipado · Caso IHC-06

**Responsable:** Karen Molina · **Revisor:** Bryan Guatemal

## 1. Técnica elegida: prototipo en código (HTML, CSS y JavaScript)

| Técnica (G3) | ¿Sirve para el riesgo de IHC-06? | Por qué |
|---|---|---|
| Papel | No | No hay tiempos ni cortes de red. El fallo de la tarjeta (carga indefinida) es una cuestión de **tiempo**. |
| Clic a clic (Figma) | No | Las pantallas son fijas: no se puede simular que la red falla a mitad del envío ni que los datos sobreviven a una recarga |
| Mago de Oz | Parcial | Una persona podría «hacer de red», pero no se podría medir el tiempo de espera ni probar la recarga del navegador |
| Storyboard | Apoyo | Sirve para contar el contexto de Rosa (señal que va y viene), no para probar |
| **Código** | **Sí** | Temporizadores reales (límite de 12 s), red simulada controlable desde el panel del observador, guardado real en `localStorage` (se puede recargar) y versionado v1 → v2 |

**Riesgo del caso:** que Rosa no sepa si su cita quedó confirmada porque la red falla a mitad del envío. Para probarlo hacen falta estados reales de espera, fallo y reintento.

## 2. Fidelidad y profundidad

| Eje (G3) | Nivel | Explicación |
|---|---|---|
| Visual | Media-alta | Diseño móvil de 360 px con contraste ≥ 7:1; sin logotipos ni fotos (carga liviana) |
| Contenido | Alta | Los mensajes de espera y de error son lo que se prueba |
| Interacción | Alta en la tarea | Identificarse, responder, fallar, reintentar, consultar el estado y ver el comprobante |
| Alcance | **Vertical** | Solo la tarea «confirmar y consultar el estado» |
| Vida útil | **Desechable** | Red y servidor simulados; se reutilizan los textos, los estados y las decisiones |

**Qué está simulado:** la red (5 modos desde el panel del observador o con `?red=`), el servidor (valida cédula y código, guarda la confirmación) y el SMS. Se usa también el evento real `online`/`offline` del navegador: si se apaga el wifi, el indicador cambia.

| Modo de red | Comportamiento |
|---|---|
| `estable` | Responde en 1,2 s |
| `lenta` | Responde en 6 s (dentro del límite) |
| `intermitente` | Falla 1 de cada 2 solicitudes a los 2,5 s («se perdió la conexión») |
| `sin-conexion` | Falla enseguida («su teléfono no tiene conexión») |
| `colgada` | El servidor nunca responde: el límite de 12 s corta la espera (**reproduce el fallo de la tarjeta**) |

## 3. Registro de decisiones

| N.º | Decisión | Alternativa descartada | Motivo | Heurística / requisito |
|---|---|---|---|---|
| D1 | Prototipo en código | Figma | Ver punto 1 | — |
| D2 | Límite de espera de 12 s, con contador visible y botón «Detener» | Ruedita sin fin (el fallo) | Nunca una carga indefinida. 12 s permite que la red lenta (6 s) termine. | H1 · R1 |
| D3 | Guardar en `localStorage` a cada tecla (cédula, código, respuesta) y la cita descargada | Guardar solo al enviar | Si la señal cae a mitad, no se pierde nada (restricción) | H3 · R2 |
| D4 | Botón bloqueado durante el envío y clave única por respuesta | Confiar en que no pulse dos veces | Evita la doble confirmación | H5 · R4 |
| D5 | Indicador de conexión en la cabecera con `role="status"` | No mostrar la red | Rosa sabe si el problema es su señal | H1 · R2 |
| D6 | Los errores de formato se muestran al salir del campo y se quitan al escribir bien | Validar y quitar al salir del campo | Si el error se quita al salir del campo, el contenido sube y el botón se mueve justo cuando se toca, y el toque se pierde | H5 |
| D7 | Validación real de la cédula ecuatoriana (provincia + dígito verificador) | Solo contar 10 dígitos | Detecta un número cambiado antes de gastar datos en la consulta | H5 |
| D8 | **v2:** «Pendiente de envío» con ⏳, borde punteado y color ámbar, y la frase «Aún NO está confirmada» | «✓ Guardada» en verde (v1) | En v1, «guardada» y «confirmada» se veían iguales (Issue #4) | H1 · R5 |
| D9 | **v2:** mostrar la hora de la última comprobación con el centro de salud | «Actualizado» sin decir con quién | Distingue lo que está guardado en el teléfono de lo que confirmó el servidor | H1 · R5 |
| D10 | **v2 (incidencia):** el bloque de reintento recibe el foco y se anuncia; reintenta solo a los 15 / 30 / 60 s, se puede pausar y reintenta al volver la señal | Botón «Reintentar» suelto (v1) | En v1, tras el fallo el foco quedaba en el `body` y el lector no decía nada | H9 · R7 · WCAG 2.2.1, 4.1.3 |
| D11 | **v2:** el reintento automático no mueve el foco; solo anuncia | Mover el foco en cada intento | Mover el foco cada 15 s interrumpiría a Rosa si está leyendo otra cosa | R7 |
| D12 | **v2:** tras el primer reintento fallido se ofrece responder por SMS | Insistir solo con la web | Alternativa real cuando la señal no vuelve (número ficticio en el prototipo) | H9 · R3 |

## 4. Contraste medido (medición real)

| Elemento | Colores | Contraste |
|---|---|---|
| Texto principal | `#111111` sobre `#ffffff` | 18.9:1 |
| Texto de ayuda | `#3a3a3a` sobre `#ffffff` | 11.4:1 |
| Botón primario y cabecera (texto blanco) | `#ffffff` sobre `#005a8d` | 7.4:1 |
| Enlaces y botón secundario | `#005a8d` sobre `#ffffff` | 7.4:1 |
| Mensaje de error | `#a3001b` sobre `#fff1f2` | 7.4:1 |
| Confirmada / éxito | `#0a5c27` sobre `#eefaf2` | 7.6:1 |
| Pendiente / aviso (v2) | `#6b4b00` sobre `#fff6db` | 7.4:1 |
| «Sin conexión» | `#a3001b` sobre `#ffffff` | 8.2:1 |
