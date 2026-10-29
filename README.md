# 🏥 Sistema CitaClara · Evaluación Práctica Parcial 2 (IHC)

> **Universidad Técnica de Ambato (UTA)**  
> **Facultad de Ingeniería en Sistemas, Electrónica e Industrial (FISEI)**  
> **Carrera de Software** · Quinto Semestre "B" · Ciclo Académico: Agosto – Diciembre 2026  
> **Asignatura:** Interacción Humano / Computador  
> **Docente:** Ing. Jose Ruben Caiza Caizabuano, Mg.  
> **Grupo 5**

---

## 👥 Integrantes del Equipo

- **Bejarano Masabanda Carlos Fabián**
- **Guatemal Avilez Bryan Stalin**
- **Molina Nuñez Karen Valeria**
- **Solis Salinas Mario Tomás**

---

## 🎯 Descripción del Proyecto

Este repositorio contiene la resolución y entregables de la **Prueba Práctica Integradora (Variante C: Citas Médicas)**. El proyecto aborda el diagnóstico, arquitectura de información, diseño centrado en el usuario, prototipado interactivo, pruebas de usabilidad y corrección iterativa (v1 → v2) para dos casos de estudio con necesidades especiales de accesibilidad y resiliencia.

---

## 📌 Casos de Estudio

### 1. Caso IHC-05 · Visión Reducida (`Caso_IHC-05_Vision_Reducida/`)
* **Perfil de usuario:** Adulto mayor con visión reducida (presbicia, degeneración macular, uso exclusivo de teclado o zoom alto).
* **Tarea crítica:** Reservar una cita médica de especialidad (Cardiología).
* **Restricción obligatoria:** Navegación 100 % accesible mediante teclado y paleta de alto contraste verificada (WCAG AAA/AA).
* **Fallo adicional corregido:** Eliminación de errores de fecha silenciosos o ambiguos, asociando mensajes contextuales directos con atributos ARIA y foco automático.

### 2. Caso IHC-06 · Conexión Intermitente (`Caso_IHC-06_Conexion_Intermitente/`)
* **Perfil de usuario:** Paciente en zona rural con conexión móvil intermitente y plan de datos prepago limitado.
* **Tarea crítica:** Confirmar una cita médica y consultar el estado del turno.
* **Restricción obligatoria:** Conservación íntegra de la información ante pérdidas de conexión (resiliencia offline y guardado local).
* **Fallo adicional corregido:** Eliminación del estado de carga indefinido mediante timeouts explícitos, retroalimentación de estado y reintentos sin duplicación de solicitudes.

---

## 📁 Estructura del Repositorio

El proyecto cuenta con una estructura simétrica y modular para ambos casos:

```text
PRUEBA2P/
├── README.md                                # Documentación general del repositorio
│
├── Caso_IHC-05_Vision_Reducida/
│   ├── diagramas/                           # Curvas emocionales (Python), sitemaps y user-flows (Mermaid)
│   ├── docs/                                # Documentación UX: diagnóstico, requisitos, navegación, trazabilidad
│   ├── evidencias/                          # Capturas de pantallas, pruebas v1 vs v2 y validaciones visuales
│   ├── informe/                             # Informe formal de guía práctica (LaTeX / PDF compilado)
│   ├── prototipo/                           # Prototipo interactivo web (v1 y v2) + panel de observación
│   └── wireframes/                          # Bocetos Lo-Fi de pantallas y recursos en fuente/
│
└── Caso_IHC-06_Conexion_Intermitente/
    ├── diagramas/                           # Curvas emocionales (Python), sitemaps y user-flows (Mermaid)
    ├── docs/                                # Documentación UX: diagnóstico, requisitos, navegación, trazabilidad
    ├── evidencias/                          # Capturas de prueba de timeouts, fallos de red y estados de cita
    ├── informe/                             # Informe formal de guía práctica (LaTeX / PDF compilado)
    ├── prototipo/                           # Prototipo interactivo enfocado en mobile (360px) + simulador de red
    └── wireframes/                          # Bocetos Lo-Fi y recursos en fuente/
```

---

## 🚀 Cómo Ejecutar los Prototipos

Los prototipos están desarrollados con tecnologías web estándar (**HTML5, CSS3 y JavaScript Vanilla**), sin frameworks ni dependencias externas.

### Opción 1: Ejecución Directa en el Navegador
1. Navegue a la carpeta del caso deseado (`Caso_IHC-05_Vision_Reducida/prototipo/` o `Caso_IHC-06_Conexion_Intermitente/prototipo/`).
2. Abra directamente con doble clic el archivo `v1/index.html` o `v2/index.html` en Chrome, Edge o Firefox.
   * *Para Caso 06:* Abra las Herramientas de Desarrollo (<kbd>F12</kbd>) y active la vista responsiva móvil (<kbd>Ctrl</kbd> + <kbd>Mayús</kbd> + <kbd>M</kbd>) en 360 px.

### Opción 2: Servidor Local Ligero (Recomendado)
Desde la terminal en la raíz de cualquier caso o prototipo:
```bash
# Servidor Python
python -m http.server 8000

# O con Node (si tiene instalado http-server o serve)
npx serve
```
Luego ingrese en su navegador a `http://localhost:8000/v1/` o `http://localhost:8000/v2/`.

---

## 🛠️ Panel del Observador y Parámetros de Simulación

Los prototipos integran herramientas de telemetría y simulación de fallos para pruebas de usabilidad:

* Presione <kbd>F2</kbd> dentro de cualquier pantalla del prototipo para abrir/cerrar el **Panel del Observador** (registra tiempos por paso, clics erróneos y pausas).
* **Parámetros por URL:**
  * `?observador=1`: Inicializa el prototipo con el panel de métricas visible.
  * `?fallo=una`: Simula un fallo de red o confirmación en el primer intento para evaluar la recuperación.
  * `?fallo=siempre`: Simula fallo continuo en la conexión o validación.

---

## 📊 Trazabilidad y Metodología Aplicada

1. **Fase 1 · Diagnóstico UX:** Identificación de touchpoints, momentos de verdad, evaluación heurística (Nielsen H1, H3, H4, H5, H9) y curva emocional (antes/después).
2. **Fase 2 · Arquitectura de Información:** Sitemap jerárquico, flujos de usuario (User Flow con rutas de recuperación ante error), desglose con **Atomic Design** y matriz de trazabilidad integral.
3. **Fase 3 · Prototipado y Validación:** Implementación de prototipo navegable accesible y con soporte para intermitencia de red.
4. **Fase 4 · Pruebas y Corrección:** Prueba con observador externo, registro de métricas reales y despliegue de mejoras aplicadas en la versión `v2`.

---

## 📄 Informes Académicos

Los informes completos con la sustentación metodológica, tablas heurísticas y matrices de trazabilidad se encuentran en las subcarpetas `informe/`:
* `Caso_IHC-05_Vision_Reducida/informe/main.pdf`
* `Caso_IHC-06_Conexion_Intermitente/informe/main.pdf`

