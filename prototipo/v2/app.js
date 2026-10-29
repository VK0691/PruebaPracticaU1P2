'use strict';
/* =====================================================================
   CitaClara · Prototipo v2 · Caso IHC-05 (Variante C · Citas médicas)
   Persona: adulto mayor con visión reducida.
   Tarea crítica: reservar cita de especialidad.
   Restricción: navegación accesible y alto contraste.

   Cambios respecto a v1 (ver docs/decisiones.md y pruebas/sesion.md):
     [Issue #4] Horarios grandes que dicen con texto "Disponible" / "Ocupado"
                (en v1 los ocupados solo se veían en gris claro y eran pequeños).
     [Issue #1] Prevención: la ayuda del campo fecha dice qué días atiende la
                especialidad, el calendario limita las fechas (min/max) y el
                mensaje de error propone la fecha válida más cercana.
     [Issue #5] Incidencia sorpresa: "Reprogramar sin perder selección previa".
                Desde Mis citas o el comprobante se cambia solo la fecha y la hora;
                especialidad, médico y lugar se conservan, y la selección nueva
                tampoco se pierde si hay un error o si la persona sale y vuelve.

   Parámetros de prueba:
     ?observador=1       abre el panel de medición (también con la tecla F2)
     ?fallo=una|siempre  simula un error del sistema al confirmar o reprogramar
   ===================================================================== */

const VERSION = 'v2';
const CLAVE_RESERVA = 'cc05-' + VERSION + '-reserva';   // borrador de la reserva
const CLAVE_REPROG = 'cc05-' + VERSION + '-reprog';     // borrador de la reprogramación [Issue #5]
const CLAVE_CITAS = 'cc05-' + VERSION + '-citas';
const CLAVE_AJUSTES = 'cc05-ajustes';
const params = new URLSearchParams(location.search);
let modoFallo = params.get('fallo') || 'ninguno';
let fallosRestantes = modoFallo === 'una' ? 1 : 0;

/* ---------- Datos simulados ---------- */
const ESPECIALIDADES = [
  { id: 'cardiologia', nombre: 'Cardiología', dias: [1, 2, 3, 4, 5], medicos: ['Dra. Andrea Villacís', 'Dr. Pablo Mena'] },
  { id: 'oftalmologia', nombre: 'Oftalmología', dias: [1, 3, 5], medicos: ['Dr. Jorge Salazar', 'Dra. Lucía Paredes'] },
  { id: 'traumatologia', nombre: 'Traumatología', dias: [2, 4], medicos: ['Dr. Ramiro Cevallos', 'Dra. Elena Ruiz'] },
  { id: 'medicina-interna', nombre: 'Medicina interna', dias: [1, 2, 3, 4, 5], medicos: ['Dra. Sofía Haro', 'Dr. Iván Lozada'] },
  { id: 'otorrino', nombre: 'Otorrinolaringología', dias: [2, 3, 4], medicos: ['Dr. Marco Tapia'] }
];
const SEDES = [
  { id: 'central', nombre: 'Hospital Central', direccion: 'Av. Principal y Calle 5, planta baja' },
  { id: 'norte', nombre: 'Centro de Especialidades Norte', direccion: 'Calle Los Andes 120, primer piso' }
];
const FERIADOS = {
  '2026-11-02': 'Día de los Difuntos',
  '2026-11-03': 'Independencia de Cuenca',
  '2026-12-25': 'Navidad',
  '2027-01-01': 'Año Nuevo'
};
const HORAS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MAX_DIAS = 60;
const PACIENTE = { nombre: 'Luis Alberto Naranjo', cedula: '18•••••567' };

/* ---------- Almacenamiento ---------- */
function leer(almacen, clave, porDefecto) {
  try { const v = almacen.getItem(clave); return v ? JSON.parse(v) : porDefecto; } catch (e) { return porDefecto; }
}
function escribir(almacen, clave, valor) {
  try { almacen.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sigue en memoria */ }
}
const reservaVacia = () => ({ especialidad: '', medico: 'cualquiera', sede: '', fecha: '', hora: '' });
let reserva = Object.assign(reservaVacia(), leer(sessionStorage, CLAVE_RESERVA, {}));
let reprog = leer(sessionStorage, CLAVE_REPROG, null);   // { codigo, fecha, hora }
let citas = leer(localStorage, CLAVE_CITAS, []);
const guardarReserva = () => escribir(sessionStorage, CLAVE_RESERVA, reserva);
const guardarReprog = () => escribir(sessionStorage, CLAVE_REPROG, reprog);
const guardarCitas = () => escribir(localStorage, CLAVE_CITAS, citas);

/* ---------- Utilidades ---------- */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const vista = $('#vista');
const esperar = (ms) => new Promise(r => setTimeout(r, ms));
function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function anunciar(texto) {
  const a = $('#anuncio');
  a.textContent = '';
  setTimeout(() => { a.textContent = texto; }, 60);
}

function hoy() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function sumarDias(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function aISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function deISO(s) { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); }
const formatoLargo = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
function fechaLarga(iso) { return formatoLargo.format(deISO(iso)); }
function fechaCorta(iso) { const [a, m, d] = iso.split('-'); return d + '/' + m + '/' + a; }
function listaDias(dias) {
  const n = dias.map(d => DIAS_SEMANA[d]);
  return n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
}

const especialidad = (id) => ESPECIALIDADES.find(e => e.id === id);
const sede = (id) => SEDES.find(s => s.id === id);
function medicoEfectivo(r = reserva) {
  const esp = especialidad(r.especialidad);
  if (!esp) return '';
  return r.medico && r.medico !== 'cualquiera' ? r.medico : esp.medicos[0];
}
function nombreMedico(r = reserva) {
  return r.medico === 'cualquiera' ? 'Cualquier médico disponible' : r.medico;
}
function horasOcupadas(fechaIso, medico) {
  let h = 7;
  for (const c of fechaIso + medico) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HORAS.filter((_, i) => ((h >>> (i % 16)) + i * 3) % 5 < 2);
}

/* ---------- Validación de la fecha ---------- */
function motivoFecha(valor, incompleta, esp, medico) {
  if (incompleta) return 'La fecha está incompleta. Escriba el día, el mes y el año. Ejemplo: 16/11/2026.';
  if (!valor) return 'Escriba o elija la fecha de la cita.';
  if (Number(valor.slice(0, 4)) < 2000) return 'El año ' + Number(valor.slice(0, 4)) + ' no es válido. Escriba el año con 4 cifras, por ejemplo 2026.';
  const d = deISO(valor);
  const manana = sumarDias(hoy(), 1);
  const maximo = sumarDias(hoy(), MAX_DIAS);
  if (d < hoy()) return 'La fecha ' + fechaCorta(valor) + ' ya pasó.';
  if (d < manana) return 'Las citas se reservan con al menos un día de anticipación.';
  if (d > maximo) return 'Solo se puede reservar hasta el ' + fechaLarga(aISO(maximo)) + '.';
  if (FERIADOS[valor]) return 'El ' + fechaLarga(valor) + ' es feriado (' + FERIADOS[valor] + ') y no hay atención.';
  if (!esp.dias.includes(d.getDay())) return esp.nombre + ' atiende solo los ' + listaDias(esp.dias) + '. El ' + fechaCorta(valor) + ' es ' + DIAS_SEMANA[d.getDay()] + '.';
  if (horasOcupadas(valor, medico).length === HORAS.length) return 'Ya no quedan horarios el ' + fechaLarga(valor) + '.';
  return '';
}
/* Fecha válida más cercana a partir de "desde" (o desde mañana) */
function proximaFecha(esp, medico, desde) {
  let d = desde ? deISO(desde) : sumarDias(hoy(), 1);
  if (d < sumarDias(hoy(), 1) || Number(aISO(d).slice(0, 4)) < 2000) d = sumarDias(hoy(), 1);
  for (let i = 0; i <= MAX_DIAS; i++) {
    const iso = aISO(d);
    if (!motivoFecha(iso, false, esp, medico)) return iso;
    d = sumarDias(d, 1);
  }
  return '';
}
/* [Issue #1 · v2] El mensaje dice qué pasó, cómo corregirlo y propone la fecha más cercana */
function validarFecha(valor, incompleta, esp, medico) {
  const motivo = motivoFecha(valor, incompleta, esp, medico);
  if (!motivo) return { mensaje: '', sugerida: '' };
  if (incompleta || !valor) return { mensaje: motivo, sugerida: '' };
  const sugerida = proximaFecha(esp, medico, valor) || proximaFecha(esp, medico);
  return {
    mensaje: motivo + (sugerida ? ' La fecha disponible más cercana es el ' + fechaLarga(sugerida) + '.' : ' Elija otro día.'),
    sugerida
  };
}

/* ---------- Mensajes de error asociados al campo ---------- */
function objetivoDe(c) { return c.tagName === 'FIELDSET' ? c : c.querySelector('input, select'); }
function limpiarError(id) {
  const c = document.getElementById(id);
  if (!c) return;
  c.classList.remove('grupo--error', 'campo--error');
  const p = document.getElementById('error-' + id);
  if (p) p.remove();
  const obj = objetivoDe(c);
  if (!obj) return;
  const resto = (obj.getAttribute('aria-describedby') || '').split(' ').filter(x => x && x !== 'error-' + id).join(' ');
  if (resto) obj.setAttribute('aria-describedby', resto); else obj.removeAttribute('aria-describedby');
  obj.removeAttribute('aria-invalid');
}
function mostrarError(id, mensaje) {
  const c = document.getElementById(id);
  if (!c) return;
  limpiarError(id);
  c.classList.add(c.tagName === 'FIELDSET' ? 'grupo--error' : 'campo--error');
  const p = document.createElement('p');
  p.className = 'mensaje-error';
  p.id = 'error-' + id;
  p.innerHTML = '<span class="solo-lector">Error: </span><span aria-hidden="true">⚠ </span>' + esc(mensaje);
  const ancla = c.querySelector('.ayuda') || c.querySelector('legend, label');
  ancla.after(p);
  const obj = objetivoDe(c);
  obj.setAttribute('aria-describedby', ((obj.getAttribute('aria-describedby') || '') + ' ' + p.id).trim());
  if (c.tagName !== 'FIELDSET') obj.setAttribute('aria-invalid', 'true');
  Observador.evento('error-validacion', mensaje);
}
function enfocarCampo(id) {
  const c = document.getElementById(id);
  if (!c) return;
  const el = c.querySelector('input:checked') || c.querySelector('input:not([disabled]), select:not([disabled])');
  if (el) el.focus();
}
function mostrarErrores(lista) {
  lista.forEach(([id, msg]) => mostrarError(id, msg));
  $('#resumen-errores').innerHTML =
    '<div class="resumen-errores"><h2>' + (lista.length === 1 ? 'Hay 1 dato por corregir' : 'Hay ' + lista.length + ' datos por corregir') + '</h2><ul>' +
    lista.map(([id, msg]) => '<li><a href="#' + id + '" data-ir="' + id + '">' + esc(msg) + '</a></li>').join('') + '</ul></div>';
  enfocarCampo(lista[0][0]);
}
function limpiarResumen() { const r = $('#resumen-errores'); if (r) r.innerHTML = ''; }

/* ---------- Diálogo de confirmación accesible ---------- */
function preguntar({ titulo, texto, seguro, peligro }) {
  return new Promise(resolve => {
    const d = $('#dialogo');
    const previo = document.activeElement;
    $('#dialogo-titulo').textContent = titulo;
    $('#dialogo-texto').textContent = texto;
    const bs = $('#dialogo-seguro');
    const bp = $('#dialogo-peligro');
    bs.textContent = seguro;
    bp.textContent = peligro;
    const cerrar = (valor) => {
      d.close();
      bs.onclick = null; bp.onclick = null; d.oncancel = null;
      if (!valor && previo && document.contains(previo)) previo.focus();
      resolve(valor);
    };
    bs.onclick = () => cerrar(false);
    bp.onclick = () => cerrar(true);
    d.oncancel = (e) => { e.preventDefault(); cerrar(false); };
    d.showModal();
    bs.focus();
  });
}

/* ---------- Piezas reutilizables ---------- */
function pasos(n) {
  const nombres = ['Especialidad y médico', 'Fecha y horario', 'Revisar y confirmar'];
  return '<ol class="pasos" aria-label="Pasos de la reserva">' + nombres.map((t, i) => {
    const num = i + 1;
    const hecho = num < n;
    return '<li class="' + (hecho ? 'hecho' : '') + '"' + (num === n ? ' aria-current="step"' : '') + '>' +
      (hecho ? '<span class="solo-lector">Completado: </span>' : '') + 'Paso ' + num + ' de 3: ' + t + '</li>';
  }).join('') + '</ol>';
}
function opcionesMedico(esp) {
  if (!esp) return '<option value="cualquiera">Primero elija la especialidad</option>';
  return '<option value="cualquiera">Cualquier médico disponible</option>' +
    esp.medicos.map(m => '<option value="' + esc(m) + '"' + (m === reserva.medico ? ' selected' : '') + '>' + esc(m) + '</option>').join('');
}
function detalleCita(c, conCambiar) {
  const fila = (dt, dd, destino, que) =>
    '<div><dt>' + dt + '</dt><dd>' + dd + '</dd>' +
    (conCambiar && destino ? '<dd><a href="' + destino + '">Cambiar<span class="solo-lector"> ' + que + '</span></a></dd>' : '<dd></dd>') + '</div>';
  return '<dl class="resumen">' +
    fila('Paciente', esc(PACIENTE.nombre) + '<br><small>Cédula ' + PACIENTE.cedula + '</small>') +
    fila('Especialidad', esc(especialidad(c.especialidad).nombre), '#/paso-1?volver=resumen', 'especialidad') +
    fila('Médico', esc(c.codigo ? c.medico + (c.asignado ? ' (asignado)' : '') : nombreMedico(c)), '#/paso-1?volver=resumen', 'médico') +
    fila('Lugar', esc(sede(c.sede).nombre) + '<br><small>' + esc(sede(c.sede).direccion) + '</small>', '#/paso-1?volver=resumen', 'lugar') +
    fila('Fecha', fechaLarga(c.fecha), '#/paso-2?volver=resumen', 'fecha') +
    fila('Hora', c.hora, '#/paso-2?volver=resumen', 'hora') +
    '</dl>';
}
function rutaContinuar() {
  if (reserva.especialidad && reserva.sede && reserva.fecha && reserva.hora) return '#/paso-3';
  if (reserva.especialidad && reserva.sede) return '#/paso-2';
  return '#/paso-1';
}

/* [Issue #4 · v2] Horarios con estado en texto, tamaño grande y conteo de disponibles */
function htmlHoras(fecha, horaElegida, medico, actual) {
  const ocupadas = horasOcupadas(fecha, medico);
  const libres = HORAS.length - ocupadas.length;
  return '<fieldset class="grupo" id="grupo-hora" aria-describedby="ayuda-hora"><legend>Horario del ' + fechaLarga(fecha) + '</legend>' +
    '<p class="ayuda" id="ayuda-hora">Hay <strong>' + libres + ' horarios disponibles</strong>. Los ocupados aparecen tachados y no se pueden elegir.</p>' +
    '<div class="horas">' + HORAS.map(h => {
      const esActual = actual && actual.fecha === fecha && actual.hora === h;
      const oc = ocupadas.includes(h) && !esActual;
      const estado = esActual ? 'Su hora actual' : (oc ? '<span aria-hidden="true">✕ </span>Ocupado' : 'Disponible');
      return '<label class="hora' + (oc ? ' hora--ocupada' : '') + (esActual ? ' hora--actual' : '') + '">' +
        '<input type="radio" name="hora" value="' + h + '"' + (oc ? ' disabled' : '') + (horaElegida === h ? ' checked' : '') + '>' +
        '<span class="hora__tiempo">' + h + '</span><span class="hora__estado">' + estado + '</span></label>';
    }).join('') + '</div></fieldset>';
}
function ayudaFecha(esp) {
  const max = aISO(sumarDias(hoy(), MAX_DIAS));
  return esp.nombre + ' atiende los <strong>' + listaDias(esp.dias) + '</strong> (no atiende feriados). ' +
    'Puede reservar desde mañana hasta el ' + fechaCorta(max) + '. Formato: día/mes/año.';
}

/* Formulario de fecha y hora: lo usan el paso 2 y la reprogramación.
   "obj" es el objeto donde se guarda la selección (reserva o reprog). */
function htmlFormFechaHora(obj, esp, medico, actual) {
  const valida = obj.fecha && !motivoFecha(obj.fecha, false, esp, medico);
  const prox = proximaFecha(esp, medico);
  return '<div class="campo" id="campo-fecha"><label class="etiqueta" for="fecha">' + (actual ? 'Nueva fecha' : 'Fecha de la cita') + '</label>' +
    '<p class="ayuda" id="ayuda-fecha">' + ayudaFecha(esp) + '</p>' +
    '<input type="date" id="fecha" name="fecha" value="' + esc(obj.fecha) + '" min="' + aISO(sumarDias(hoy(), 1)) + '" max="' + aISO(sumarDias(hoy(), MAX_DIAS)) + '" aria-describedby="ayuda-fecha">' +
    '<p class="sugerencia" id="sugerencia">' + (prox ? '<button type="button" class="boton boton--secundario boton--chico" data-accion="usar-fecha" data-fecha="' + prox + '">Usar la próxima fecha disponible: ' + fechaLarga(prox) + '</button>' : '') + '</p></div>' +
    '<div id="zona-horas">' + (valida ? htmlHoras(obj.fecha, obj.hora, medico, actual) : '') + '</div>';
}
function montarFormFechaHora(obj, esp, medico, guardar, actual) {
  const campo = $('#fecha');
  const zona = $('#zona-horas');
  const sugerencia = $('#sugerencia');
  function ponerSugerencia(iso) {
    sugerencia.innerHTML = iso ? '<button type="button" class="boton boton--secundario boton--chico" data-accion="usar-fecha" data-fecha="' + iso + '">Usar el ' + fechaLarga(iso) + '</button>' : '';
  }
  function revisar() {
    obj.fecha = campo.value;
    const r = validarFecha(campo.value, campo.validity.badInput, esp, medico);
    if (r.mensaje && (campo.value || campo.validity.badInput)) {
      limpiarResumen();
      mostrarError('campo-fecha', r.mensaje);
      anunciar(r.mensaje);
      ponerSugerencia(r.sugerida);
      zona.innerHTML = '';
    } else if (!r.mensaje) {
      limpiarError('campo-fecha');
      limpiarResumen();
      sugerencia.innerHTML = '';
      if (obj.hora && horasOcupadas(obj.fecha, medico).includes(obj.hora) && !(actual && actual.fecha === obj.fecha && actual.hora === obj.hora)) obj.hora = '';
      zona.innerHTML = htmlHoras(obj.fecha, obj.hora, medico, actual);
      const libres = HORAS.length - horasOcupadas(obj.fecha, medico).length;
      anunciar('Fecha válida. Hay ' + libres + ' horarios disponibles el ' + fechaLarga(obj.fecha) + '.');
    }
    guardar();
  }
  campo.addEventListener('change', () => {
    if (campo.value && Number(campo.value.slice(0, 4)) < 2000) return; // aún se escribe el año
    revisar();
  });
  campo.addEventListener('blur', () => {
    if (campo.validity.badInput || (campo.value && Number(campo.value.slice(0, 4)) < 2000)) {
      mostrarError('campo-fecha', validarFecha(campo.value, campo.validity.badInput, esp, medico).mensaje);
    }
  });
  zona.addEventListener('change', (e) => {
    if (e.target.name === 'hora') { obj.hora = e.target.value; guardar(); limpiarError('grupo-hora'); }
  });
  // Botón "Usar esta fecha": completa el campo y deja el foco en los horarios
  campo.closest('form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion="usar-fecha"]');
    if (!b) return;
    campo.value = b.dataset.fecha;
    revisar();
    const primera = zona.querySelector('input:checked') || zona.querySelector('input:not([disabled])');
    if (primera) primera.focus();
  });
  // Validación al enviar. Devuelve true si todo está bien.
  return function validarTodo() {
    obj.fecha = campo.value;
    const r = validarFecha(campo.value, campo.validity.badInput, esp, medico);
    if (r.mensaje) { zona.innerHTML = ''; ponerSugerencia(r.sugerida); mostrarErrores([['campo-fecha', r.mensaje]]); return false; }
    if (!obj.hora) {
      if (!$('#grupo-hora')) zona.innerHTML = htmlHoras(obj.fecha, obj.hora, medico, actual);
      mostrarErrores([['grupo-hora', 'Elija un horario disponible.']]);
      return false;
    }
    if (actual && actual.fecha === obj.fecha && actual.hora === obj.hora) {
      mostrarErrores([['grupo-hora', 'Esa es la fecha y hora de su cita actual. Elija otra hora u otra fecha, o pulse «No reprogramar».']]);
      return false;
    }
    guardar();
    return true;
  };
}

/* =====================================================================
   VISTAS
   ===================================================================== */
const VISTAS = {};

VISTAS.inicio = {
  titulo: () => 'Inicio',
  html: () => {
    const esp = especialidad(reserva.especialidad);
    return '<h1>Bienvenido, ' + esc(PACIENTE.nombre.split(' ')[0]) + '</h1>' +
      '<p>Aquí puede reservar una cita con un médico especialista. Son 3 pasos cortos.</p>' +
      (esp ? '<section class="tarjeta aviso" aria-labelledby="t-pendiente"><h2 id="t-pendiente">Tiene una reserva sin terminar</h2>' +
        '<p>Especialidad: <strong>' + esc(esp.nombre) + '</strong>' + (reserva.fecha ? ', ' + fechaLarga(reserva.fecha) : '') + '. Guardamos lo que ya eligió.</p>' +
        '<div class="acciones"><a class="boton boton--primario" href="' + rutaContinuar() + '">Continuar la reserva</a>' +
        '<button type="button" class="boton boton--secundario" data-accion="descartar">Empezar de nuevo</button></div></section>' : '') +
      '<div class="acciones" style="flex-direction:column;align-items:flex-start">' +
      '<a class="boton boton--primario boton--grande" href="#/paso-1">Reservar cita con especialista</a>' +
      '<a class="boton boton--secundario boton--grande" href="#/mis-citas">Ver o reprogramar mis citas</a></div>' +
      '<section class="tarjeta" aria-labelledby="t-teclado"><h2 id="t-teclado">Cómo usar esta página con el teclado</h2><ul>' +
      '<li><kbd>Tab</kbd> avanza y <kbd>Mayús</kbd> + <kbd>Tab</kbd> regresa.</li>' +
      '<li>Las flechas eligen una opción; <kbd>Enter</kbd> pulsa el botón.</li>' +
      '<li>Arriba puede agrandar la letra o activar el contraste máximo.</li></ul></section>';
  }
};

VISTAS['paso-1'] = {
  titulo: () => 'Paso 1 de 3: Especialidad y médico',
  html: (r) => {
    const esp = especialidad(reserva.especialidad);
    const volver = r.q.get('volver') === 'resumen';
    return pasos(1) +
      '<h1>¿Con qué especialista necesita la cita?</h1>' +
      '<div id="resumen-errores"></div>' +
      '<form id="formulario" novalidate>' +
      '<fieldset class="grupo" id="grupo-especialidad" aria-describedby="ayuda-especialidad"><legend>Especialidad</legend>' +
      '<p class="ayuda" id="ayuda-especialidad">Si tiene una orden de su médico, elija la especialidad que dice la orden.</p>' +
      '<div class="opciones">' + ESPECIALIDADES.map(e =>
        '<label class="opcion"><input type="radio" name="especialidad" value="' + e.id + '"' + (e.id === reserva.especialidad ? ' checked' : '') + '> ' + e.nombre + '</label>').join('') +
      '</div></fieldset>' +
      '<div class="campo" id="campo-medico"><label class="etiqueta" for="medico">Médico</label>' +
      '<p class="ayuda" id="ayuda-medico">' + (esp ? 'Puede elegir un médico o dejar que le asignemos el primero disponible.' : 'Primero elija la especialidad.') + '</p>' +
      '<select id="medico" name="medico" aria-describedby="ayuda-medico"' + (esp ? '' : ' disabled') + '>' + opcionesMedico(esp) + '</select></div>' +
      '<fieldset class="grupo" id="grupo-sede"><legend>Lugar de atención</legend><div class="opciones">' +
      SEDES.map(s => '<label class="opcion"><input type="radio" name="sede" value="' + s.id + '"' + (s.id === reserva.sede ? ' checked' : '') + '><span>' + s.nombre + '<small>' + s.direccion + '</small></span></label>').join('') +
      '</div></fieldset>' +
      '<div class="acciones"><button type="submit" class="boton boton--primario">' + (volver ? 'Guardar y volver al resumen' : 'Continuar al paso 2') + '</button>' +
      '<button type="button" class="boton boton--secundario" data-accion="cancelar">Cancelar reserva</button></div></form>';
  },
  montar: (r) => {
    const form = $('#formulario');
    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'especialidad') {
        if (reserva.especialidad !== t.value) { reserva.medico = 'cualquiera'; reserva.hora = ''; }
        reserva.especialidad = t.value;
        const sel = $('#medico');
        sel.disabled = false;
        sel.innerHTML = opcionesMedico(especialidad(t.value));
        $('#ayuda-medico').textContent = 'Puede elegir un médico o dejar que le asignemos el primero disponible.';
        limpiarError('grupo-especialidad');
      }
      if (t.name === 'medico') { reserva.medico = t.value; reserva.hora = ''; }
      if (t.name === 'sede') { reserva.sede = t.value; limpiarError('grupo-sede'); }
      guardarReserva();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errores = [];
      if (!reserva.especialidad) errores.push(['grupo-especialidad', 'Elija la especialidad que necesita.']);
      if (!reserva.sede) errores.push(['grupo-sede', 'Elija el lugar donde quiere ser atendido.']);
      if (errores.length) { mostrarErrores(errores); return; }
      const volver = r.q.get('volver') === 'resumen';
      location.hash = volver && reserva.hora ? '#/paso-3' : (volver ? '#/paso-2?volver=resumen' : '#/paso-2');
    });
  }
};

VISTAS['paso-2'] = {
  titulo: () => 'Paso 2 de 3: Fecha y horario',
  guardia: () => (!reserva.especialidad || !reserva.sede) ? '#/paso-1' : null,
  html: (r) => {
    const esp = especialidad(reserva.especialidad);
    const volver = r.q.get('volver') === 'resumen';
    return pasos(2) +
      '<h1>¿Qué día y a qué hora quiere su cita?</h1>' +
      '<p><strong>' + esc(esp.nombre) + '</strong> · ' + esc(nombreMedico()) + ' · ' + esc(sede(reserva.sede).nombre) + '</p>' +
      '<div id="resumen-errores"></div>' +
      '<form id="formulario" novalidate>' + htmlFormFechaHora(reserva, esp, medicoEfectivo()) +
      '<div class="acciones"><button type="submit" class="boton boton--primario">' + (volver ? 'Guardar y volver al resumen' : 'Continuar al paso 3') + '</button>' +
      '<a class="boton boton--secundario" href="#/paso-1">Volver al paso 1</a>' +
      '<button type="button" class="boton boton--texto" data-accion="cancelar">Cancelar reserva</button></div></form>';
  },
  montar: () => {
    const validarTodo = montarFormFechaHora(reserva, especialidad(reserva.especialidad), medicoEfectivo(), guardarReserva);
    $('#formulario').addEventListener('submit', (e) => {
      e.preventDefault();
      if (validarTodo()) location.hash = '#/paso-3';
    });
  }
};

VISTAS['paso-3'] = {
  titulo: () => 'Paso 3 de 3: Revisar y confirmar',
  guardia: () => {
    if (!reserva.especialidad || !reserva.sede) return '#/paso-1';
    if (!reserva.fecha || !reserva.hora || motivoFecha(reserva.fecha, false, especialidad(reserva.especialidad), medicoEfectivo())) return '#/paso-2';
    return null;
  },
  html: () => pasos(3) +
    '<h1>Revise los datos de su cita</h1>' +
    '<p>Si algo no está bien, use «Cambiar». No perderá lo que ya eligió.</p>' +
    '<section class="tarjeta" aria-label="Datos de la cita">' + detalleCita(reserva, true) + '</section>' +
    '<div id="zona-estado"></div>' +
    '<div class="acciones" id="acciones-confirmar">' +
    '<button type="button" class="boton boton--primario" data-accion="confirmar">Confirmar cita</button>' +
    '<a class="boton boton--secundario" href="#/paso-2">Volver al paso 2</a>' +
    '<button type="button" class="boton boton--texto" data-accion="cancelar">Cancelar reserva</button></div>'
};

/* Envío simulado al sistema: espera, y falla si el observador lo pidió */
async function enviarAlSistema(textoCarga, alFallar) {
  const acciones = $('#acciones-confirmar');
  const zona = $('#zona-estado');
  acciones.querySelectorAll('button').forEach(b => { b.disabled = true; }); // evita doble envío
  acciones.hidden = true;
  zona.innerHTML = '<div class="cargando" role="status" tabindex="-1"><span class="spinner" aria-hidden="true"></span><span>' + textoCarga + '</span></div>';
  zona.firstChild.focus();
  await esperar(1800);
  if (modoFallo === 'siempre' || fallosRestantes > 0) {
    if (fallosRestantes > 0) fallosRestantes--;
    Observador.evento('error-sistema', alFallar);
    zona.innerHTML = '<div class="error-sistema" tabindex="-1" role="group" aria-labelledby="t-error" aria-describedby="d-error">' +
      '<h2 id="t-error">' + alFallar + '</h2>' +
      '<p id="d-error">Fue un problema de nuestro sistema, no suyo. <strong>Lo que eligió sigue guardado</strong>; no tiene que elegirlo otra vez.</p>' +
      '<div class="acciones"><button type="button" class="boton boton--primario" data-accion="reintentar">Intentar de nuevo</button>' +
      '<a class="boton boton--secundario" href="#/inicio">Salir y volver más tarde</a></div></div>';
    zona.firstChild.focus();
    return false;
  }
  return true;
}

async function confirmarCita() {
  if (!(await enviarAlSistema('Registrando su cita… espere unos segundos, no cierre esta página.', 'No pudimos registrar su cita'))) return;
  const cita = Object.assign({}, reserva, {
    medico: medicoEfectivo(),
    asignado: reserva.medico === 'cualquiera',
    codigo: 'CC-' + Math.floor(1000 + Math.random() * 9000),
    estado: 'confirmada',
    creada: new Date().toISOString(),
    historial: []
  });
  citas.push(cita);
  guardarCitas();
  reserva = reservaVacia();
  guardarReserva();
  location.hash = '#/comprobante/' + cita.codigo;
}

/* ---------- [Issue #5] Incidencia sorpresa: reprogramar sin perder la selección previa ---------- */
VISTAS.reprogramar = {
  titulo: () => 'Reprogramar cita',
  guardia: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    return (!c || c.estado !== 'confirmada') ? '#/mis-citas' : null;
  },
  html: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    // Si ya había empezado a reprogramar esta cita, se recupera lo que eligió.
    if (!reprog || reprog.codigo !== c.codigo) { reprog = { codigo: c.codigo, fecha: c.fecha, hora: c.hora }; guardarReprog(); }
    const esp = especialidad(c.especialidad);
    return '<h1>Reprogramar su cita</h1>' +
      '<p>Solo elija la nueva fecha y hora. <strong>Su especialidad, médico y lugar se mantienen.</strong> Su cita actual no cambia hasta que confirme.</p>' +
      '<section class="tarjeta" aria-labelledby="t-actual"><h2 id="t-actual">Su cita actual</h2><dl class="resumen">' +
      '<div><dt>Especialidad</dt><dd>' + esc(esp.nombre) + '</dd><dd></dd></div>' +
      '<div><dt>Médico</dt><dd>' + esc(c.medico) + '</dd><dd></dd></div>' +
      '<div><dt>Lugar</dt><dd>' + esc(sede(c.sede).nombre) + '</dd><dd></dd></div>' +
      '<div><dt>Fecha y hora</dt><dd>' + fechaLarga(c.fecha) + ', ' + c.hora + '</dd><dd></dd></div>' +
      '<div><dt>Código</dt><dd>' + c.codigo + '</dd><dd></dd></div></dl></section>' +
      '<div id="resumen-errores"></div>' +
      '<form id="formulario" novalidate>' + htmlFormFechaHora(reprog, esp, c.medico, { fecha: c.fecha, hora: c.hora }) +
      '<div id="zona-estado"></div>' +
      '<div class="acciones" id="acciones-confirmar"><button type="submit" class="boton boton--primario">Confirmar nueva fecha y hora</button>' +
      '<button type="button" class="boton boton--secundario" data-accion="no-reprogramar">No reprogramar, mantener mi cita</button></div></form>';
  },
  montar: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    const validarTodo = montarFormFechaHora(reprog, especialidad(c.especialidad), c.medico, guardarReprog, { fecha: c.fecha, hora: c.hora });
    $('#formulario').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validarTodo()) return;
      if (!(await enviarAlSistema('Guardando el cambio de su cita…', 'No pudimos reprogramar su cita'))) return;
      c.historial = (c.historial || []).concat([{ fecha: c.fecha, hora: c.hora }]);
      c.fecha = reprog.fecha;
      c.hora = reprog.hora;
      c.reprogramada = true;
      guardarCitas();
      reprog = null;
      guardarReprog();
      location.hash = '#/comprobante/' + c.codigo;
    });
  }
};

VISTAS.comprobante = {
  titulo: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    return c && c.reprogramada ? 'Cita reprogramada' : 'Cita confirmada';
  },
  html: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    if (!c) return '<h1>No encontramos ese comprobante</h1><p><a href="#/mis-citas">Ver mis citas</a></p>';
    const anterior = c.historial && c.historial.length ? c.historial[c.historial.length - 1] : null;
    return '<div class="exito"><h1><span aria-hidden="true">✓ </span>' + (c.reprogramada ? 'Su cita fue reprogramada' : 'Su cita está confirmada') + '</h1>' +
      '<p>Código de su cita: <span class="codigo">' + c.codigo + '</span></p>' +
      (anterior ? '<p>Antes era el ' + fechaLarga(anterior.fecha) + ' a las ' + anterior.hora + '. Ese horario quedó libre.</p>' : '') +
      '<p>Llegue 20 minutos antes con su cédula y la orden médica. Le enviamos un recordatorio al celular registrado (simulado).</p></div>' +
      '<section class="tarjeta" aria-label="Detalle de la cita">' + detalleCita(c, false) + '</section>' +
      '<div class="acciones"><button type="button" class="boton boton--primario" data-accion="imprimir">Imprimir comprobante</button>' +
      '<a class="boton boton--secundario" href="#/mis-citas">Ver mis citas</a>' +
      '<a class="boton boton--texto" href="#/reprogramar/' + c.codigo + '">Reprogramar esta cita</a>' +
      '<a class="boton boton--texto" href="#/inicio">Volver al inicio</a></div>';
  },
  montar: (r) => { Observador.evento('tarea-completada', r.arg); }
};

VISTAS['mis-citas'] = {
  titulo: () => 'Mis citas',
  html: () => {
    const lista = citas.slice().reverse();
    return '<h1>Mis citas</h1>' + (lista.length ? lista.map(c => {
      const esp = especialidad(c.especialidad).nombre;
      const activa = c.estado === 'confirmada';
      return '<article class="tarjeta" aria-labelledby="t-' + c.codigo + '">' +
        '<h2 id="t-' + c.codigo + '">' + esc(esp) + ' · ' + fechaLarga(c.fecha) + ', ' + c.hora + '</h2>' +
        '<p>Estado: <span class="insignia insignia--' + c.estado + '">' + (activa ? (c.reprogramada ? 'Confirmada (reprogramada)' : 'Confirmada') : 'Cancelada') + '</span></p>' +
        '<p>' + esc(c.medico) + ' · ' + esc(sede(c.sede).nombre) + '<br>Código: <strong>' + c.codigo + '</strong></p>' +
        (activa ? '<div class="acciones"><a class="boton boton--primario" href="#/reprogramar/' + c.codigo + '">Reprogramar<span class="solo-lector"> cita de ' + esc(esp) + '</span></a>' +
          '<a class="boton boton--secundario" href="#/comprobante/' + c.codigo + '">Ver comprobante<span class="solo-lector"> de ' + esc(esp) + '</span></a>' +
          '<button type="button" class="boton boton--texto" data-accion="cancelar-cita" data-codigo="' + c.codigo + '">Cancelar cita<span class="solo-lector"> de ' + esc(esp) + '</span></button></div>' : '') +
        '</article>';
    }).join('') : '<p>Todavía no tiene citas reservadas.</p><div class="acciones"><a class="boton boton--primario" href="#/paso-1">Reservar cita</a></div>');
  }
};

/* =====================================================================
   NAVEGACIÓN Y EVENTOS GENERALES
   ===================================================================== */
function leerRuta() {
  const h = location.hash.replace(/^#\/?/, '');
  const [camino, consulta] = h.split('?');
  const [nombre, arg] = (camino || '').split('/');
  return { nombre: nombre || 'inicio', arg: arg || '', q: new URLSearchParams(consulta || '') };
}
function marcarMenu(nombre) {
  const grupo = nombre.startsWith('paso') ? 'paso' : (['comprobante', 'reprogramar'].includes(nombre) ? 'mis-citas' : nombre);
  document.querySelectorAll('[data-menu]').forEach(a => {
    if (a.dataset.menu === grupo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}
function render() {
  const r = leerRuta();
  const v = VISTAS[r.nombre] || VISTAS.inicio;
  const desvio = v.guardia && v.guardia(r);
  if (desvio) { location.replace(desvio); return; }
  vista.innerHTML = v.html(r);
  document.title = v.titulo(r) + ' · CitaClara (' + VERSION + ')';
  marcarMenu(r.nombre);
  if (v.montar) v.montar(r);
  const h1 = vista.querySelector('h1');
  if (h1) { h1.tabIndex = -1; h1.focus(); }
  Observador.evento('Pantalla', v.titulo(r));
}
window.addEventListener('hashchange', render);

document.addEventListener('click', async (e) => {
  const ir = e.target.closest('[data-ir]');
  if (ir) { e.preventDefault(); enfocarCampo(ir.dataset.ir); return; }
  if (e.target.closest('[data-saltar]')) { e.preventDefault(); $('#contenido').focus(); return; }
  const b = e.target.closest('[data-accion]');
  if (!b) return;
  const accion = b.dataset.accion;
  if (accion === 'confirmar') confirmarCita();
  if (accion === 'reintentar') {
    $('#acciones-confirmar').hidden = false;
    $('#acciones-confirmar').querySelectorAll('button').forEach(x => { x.disabled = false; });
    $('#zona-estado').innerHTML = '';
    if (leerRuta().nombre === 'reprogramar') $('#formulario').requestSubmit(); else confirmarCita();
  }
  if (accion === 'imprimir') window.print();
  if (accion === 'cancelar') {
    const salir = await preguntar({
      titulo: '¿Quiere salir de la reserva?',
      texto: 'Guardaremos lo que ya eligió para que pueda continuar después desde el inicio.',
      seguro: 'No, seguir con la reserva',
      peligro: 'Sí, salir'
    });
    if (salir) location.hash = '#/inicio';
  }
  if (accion === 'no-reprogramar') {
    reprog = null;
    guardarReprog();
    anunciar('Su cita se mantiene sin cambios.');
    location.hash = '#/mis-citas';
  }
  if (accion === 'descartar') {
    const ok = await preguntar({
      titulo: '¿Empezar una reserva nueva?',
      texto: 'Se borrará lo que eligió en la reserva sin terminar.',
      seguro: 'No, conservarla',
      peligro: 'Sí, empezar de nuevo'
    });
    if (ok) { reserva = reservaVacia(); guardarReserva(); location.hash = '#/paso-1'; }
  }
  if (accion === 'cancelar-cita') {
    const c = citas.find(x => x.codigo === b.dataset.codigo);
    const ok = await preguntar({
      titulo: '¿Cancelar esta cita?',
      texto: 'Se cancelará la cita de ' + especialidad(c.especialidad).nombre + ' del ' + fechaLarga(c.fecha) + ' a las ' + c.hora + '. Si solo quiere cambiar el día, use «Reprogramar».',
      seguro: 'No, mantener la cita',
      peligro: 'Sí, cancelar la cita'
    });
    if (ok) { c.estado = 'cancelada'; guardarCitas(); render(); anunciar('La cita ' + c.codigo + ' fue cancelada.'); }
  }
});

/* ---------- Ajustes de lectura ---------- */
const ajustes = Object.assign({ escala: 1, contraste: false }, leer(localStorage, CLAVE_AJUSTES, {}));
function aplicarAjustes() {
  document.documentElement.style.setProperty('--escala', ajustes.escala);
  document.body.classList.toggle('contraste-max', ajustes.contraste);
  document.querySelectorAll('[data-tam]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.tam) === ajustes.escala)));
  $('#btn-contraste').setAttribute('aria-pressed', String(ajustes.contraste));
  escribir(localStorage, CLAVE_AJUSTES, ajustes);
}
document.querySelectorAll('[data-tam]').forEach(b => b.addEventListener('click', () => { ajustes.escala = Number(b.dataset.tam); aplicarAjustes(); }));
$('#btn-contraste').addEventListener('click', () => { ajustes.contraste = !ajustes.contraste; aplicarAjustes(); });
aplicarAjustes();

Observador.agregarControl(
  '<label>Fallo al confirmar: <select data-obs-fallo><option value="ninguno">ninguno</option><option value="una">una vez</option><option value="siempre">siempre</option></select></label>',
  (c) => {
    const s = c.querySelector('[data-obs-fallo]');
    s.value = modoFallo;
    s.addEventListener('change', () => { modoFallo = s.value; fallosRestantes = modoFallo === 'una' ? 1 : 0; });
  }
);

if (!location.hash) history.replaceState(null, '', '#/inicio');
render();
