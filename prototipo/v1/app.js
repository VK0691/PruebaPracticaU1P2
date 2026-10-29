'use strict';
/* =====================================================================
   CitaClara · Prototipo v1 · Caso IHC-05 (Variante C · Citas médicas)
   Persona: adulto mayor con visión reducida.
   Tarea crítica: reservar cita de especialidad.
   Restricción: navegación accesible y alto contraste.
   Fallo de la tarjeta que se corrige: "error de fecha sin mensaje asociado al campo".

   No usa librerías ni servidor: abrir index.html en el navegador.
   Parámetros de prueba:
     ?observador=1       abre el panel de medición (también con la tecla F2)
     ?fallo=una|siempre  simula un error del sistema al confirmar la cita
   ===================================================================== */

const VERSION = 'v1';
const CLAVE_RESERVA = 'cc05-' + VERSION + '-reserva'; // borrador de la reserva (se conserva al volver o recargar)
const CLAVE_CITAS = 'cc05-' + VERSION + '-citas';     // citas confirmadas
const CLAVE_AJUSTES = 'cc05-ajustes';                 // tamaño de letra y contraste
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
const PACIENTE = { nombre: 'Luis Alberto Naranjo', cedula: '18•••••567' }; // cédula enmascarada

/* ---------- Almacenamiento (protegido por si el navegador lo bloquea) ---------- */
function leer(almacen, clave, porDefecto) {
  try { const v = almacen.getItem(clave); return v ? JSON.parse(v) : porDefecto; } catch (e) { return porDefecto; }
}
function escribir(almacen, clave, valor) {
  try { almacen.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento: sigue en memoria */ }
}
const reservaVacia = () => ({ especialidad: '', medico: 'cualquiera', sede: '', fecha: '', hora: '' });
let reserva = Object.assign(reservaVacia(), leer(sessionStorage, CLAVE_RESERVA, {}));
let citas = leer(localStorage, CLAVE_CITAS, []);
const guardarReserva = () => escribir(sessionStorage, CLAVE_RESERVA, reserva);
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

/* Fechas: se trabaja con "AAAA-MM-DD" (lo que devuelve <input type="date">) */
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

/* Horarios ocupados: simulados, pero siempre iguales para la misma fecha y médico */
function horasOcupadas(fechaIso, medico) {
  let h = 7;
  for (const c of fechaIso + medico) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HORAS.filter((_, i) => ((h >>> (i % 16)) + i * 3) % 5 < 2);
}

/* ---------- Validación de la fecha (corrige el fallo de la tarjeta IHC-05) ----------
   Cada caso devuelve un mensaje que dice QUÉ pasó y CÓMO corregirlo. */
function validarFecha(valor, incompleta, esp) {
  if (incompleta) return 'La fecha está incompleta. Escriba el día, el mes y el año. Ejemplo: 16/11/2026.';
  if (!valor) return 'Escriba o elija la fecha de la cita.';
  if (Number(valor.slice(0, 4)) < 2000) return 'El año ' + Number(valor.slice(0, 4)) + ' no es válido. Escriba el año con 4 cifras, por ejemplo 2026.';
  const d = deISO(valor);
  const manana = sumarDias(hoy(), 1);
  const maximo = sumarDias(hoy(), MAX_DIAS);
  if (d < hoy()) return 'La fecha ' + fechaCorta(valor) + ' ya pasó. Elija una fecha desde mañana, ' + fechaLarga(aISO(manana)) + '.';
  if (d < manana) return 'Las citas se reservan con al menos un día de anticipación. Elija una fecha desde mañana, ' + fechaLarga(aISO(manana)) + '.';
  if (d > maximo) return 'Solo se puede reservar hasta el ' + fechaLarga(aISO(maximo)) + '. Elija una fecha anterior.';
  if (FERIADOS[valor]) return 'El ' + fechaLarga(valor) + ' es feriado (' + FERIADOS[valor] + ') y no hay atención. Elija otro día.';
  if (!esp.dias.includes(d.getDay())) {
    return esp.nombre + ' atiende solo los ' + listaDias(esp.dias) + '. El ' + fechaCorta(valor) + ' es ' + DIAS_SEMANA[d.getDay()] + '. Elija otro día.';
  }
  if (horasOcupadas(valor, medicoEfectivo()).length === HORAS.length) return 'Ya no quedan horarios el ' + fechaLarga(valor) + '. Elija otro día.';
  return '';
}

/* ---------- Mensajes de error asociados al campo ----------
   El mensaje aparece junto al campo, se enlaza con aria-describedby y el campo
   queda marcado con aria-invalid, para que el lector de pantalla lo lea al enfocarlo. */
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

/* ---------- Diálogo de confirmación accesible (Esc = opción segura) ---------- */
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

/* ---------- Piezas de interfaz reutilizables ---------- */
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

/* =====================================================================
   VISTAS (pantallas)
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
      '<a class="boton boton--secundario boton--grande" href="#/mis-citas">Ver mis citas</a></div>' +
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

function htmlHoras() {
  const ocupadas = horasOcupadas(reserva.fecha, medicoEfectivo());
  return '<fieldset class="grupo" id="grupo-hora"><legend>Horario del ' + fechaLarga(reserva.fecha) + '</legend>' +
    '<div class="horas">' + HORAS.map(h => {
      const oc = ocupadas.includes(h);
      return '<label class="hora' + (oc ? ' hora--ocupada' : '') + '"><input type="radio" name="hora" value="' + h + '"' +
        (oc ? ' disabled' : '') + (reserva.hora === h ? ' checked' : '') + '> ' + h + '</label>';
    }).join('') + '</div></fieldset>';
}

VISTAS['paso-2'] = {
  titulo: () => 'Paso 2 de 3: Fecha y horario',
  guardia: () => (!reserva.especialidad || !reserva.sede) ? '#/paso-1' : null,
  html: (r) => {
    const esp = especialidad(reserva.especialidad);
    const volver = r.q.get('volver') === 'resumen';
    const fechaValida = reserva.fecha && !validarFecha(reserva.fecha, false, esp);
    return pasos(2) +
      '<h1>¿Qué día y a qué hora quiere su cita?</h1>' +
      '<p><strong>' + esc(esp.nombre) + '</strong> · ' + esc(nombreMedico()) + ' · ' + esc(sede(reserva.sede).nombre) + '</p>' +
      '<div id="resumen-errores"></div>' +
      '<form id="formulario" novalidate>' +
      '<div class="campo" id="campo-fecha"><label class="etiqueta" for="fecha">Fecha de la cita</label>' +
      '<p class="ayuda" id="ayuda-fecha">Escriba la fecha o elíjala en el calendario. Formato: día/mes/año.</p>' +
      '<input type="date" id="fecha" name="fecha" value="' + esc(reserva.fecha) + '" aria-describedby="ayuda-fecha"></div>' +
      '<div id="zona-horas">' + (fechaValida ? htmlHoras() : '') + '</div>' +
      '<div class="acciones"><button type="submit" class="boton boton--primario">' + (volver ? 'Guardar y volver al resumen' : 'Continuar al paso 3') + '</button>' +
      '<a class="boton boton--secundario" href="#/paso-1">Volver al paso 1</a>' +
      '<button type="button" class="boton boton--texto" data-accion="cancelar">Cancelar reserva</button></div></form>';
  },
  montar: (r) => {
    const esp = especialidad(reserva.especialidad);
    const campo = $('#fecha');
    const zona = $('#zona-horas');

    // Validación contextual: al completar o cambiar la fecha se revisa en el momento.
    // (Mientras se escribe el año, el navegador entrega fechas como 0002 o 0020: se espera al año completo.)
    campo.addEventListener('change', () => {
      if (campo.value && Number(campo.value.slice(0, 4)) < 2000) return;
      reserva.fecha = campo.value;
      const msg = validarFecha(campo.value, campo.validity.badInput, esp);
      if (msg && (campo.value || campo.validity.badInput)) {
        mostrarError('campo-fecha', msg);
        anunciar(msg);
        zona.innerHTML = '';
        reserva.hora = '';
      } else if (!msg) {
        limpiarError('campo-fecha');
        limpiarResumen();
        if (reserva.hora && horasOcupadas(reserva.fecha, medicoEfectivo()).includes(reserva.hora)) reserva.hora = '';
        zona.innerHTML = htmlHoras();
        const libres = HORAS.length - horasOcupadas(reserva.fecha, medicoEfectivo()).length;
        anunciar('Fecha válida. Hay ' + libres + ' horarios disponibles el ' + fechaLarga(reserva.fecha) + '.');
      }
      guardarReserva();
    });
    campo.addEventListener('blur', () => {
      if (campo.validity.badInput || (campo.value && Number(campo.value.slice(0, 4)) < 2000)) {
        mostrarError('campo-fecha', validarFecha(campo.value, campo.validity.badInput, esp));
      }
    });
    zona.addEventListener('change', (e) => {
      if (e.target.name === 'hora') { reserva.hora = e.target.value; guardarReserva(); limpiarError('grupo-hora'); }
    });
    $('#formulario').addEventListener('submit', (e) => {
      e.preventDefault();
      reserva.fecha = campo.value;
      const msg = validarFecha(campo.value, campo.validity.badInput, esp);
      if (msg) { zona.innerHTML = ''; mostrarErrores([['campo-fecha', msg]]); return; }
      if (!reserva.hora) {
        if (!$('#grupo-hora')) zona.innerHTML = htmlHoras();
        mostrarErrores([['grupo-hora', 'Elija un horario disponible.']]);
        return;
      }
      guardarReserva();
      location.hash = '#/paso-3';
    });
  }
};

VISTAS['paso-3'] = {
  titulo: () => 'Paso 3 de 3: Revisar y confirmar',
  guardia: () => {
    if (!reserva.especialidad || !reserva.sede) return '#/paso-1';
    if (!reserva.fecha || !reserva.hora || validarFecha(reserva.fecha, false, especialidad(reserva.especialidad))) return '#/paso-2';
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

async function confirmarCita() {
  const acciones = $('#acciones-confirmar');
  const zona = $('#zona-estado');
  const boton = acciones.querySelector('[data-accion="confirmar"]');
  boton.disabled = true;               // evita una segunda reserva por doble clic
  acciones.hidden = true;
  zona.innerHTML = '<div class="cargando" role="status" tabindex="-1"><span class="spinner" aria-hidden="true"></span>' +
    '<span>Registrando su cita… espere unos segundos, no cierre esta página.</span></div>';
  zona.firstChild.focus();
  await esperar(1800);
  if (modoFallo === 'siempre' || fallosRestantes > 0) {
    if (fallosRestantes > 0) fallosRestantes--;
    Observador.evento('error-sistema', 'No se pudo registrar la cita');
    zona.innerHTML = '<div class="error-sistema" tabindex="-1" role="group" aria-labelledby="t-error" aria-describedby="d-error">' +
      '<h2 id="t-error">No pudimos registrar su cita</h2>' +
      '<p id="d-error">Fue un problema de nuestro sistema, no suyo. <strong>Sus datos siguen guardados</strong>; no tiene que escribirlos otra vez.</p>' +
      '<div class="acciones"><button type="button" class="boton boton--primario" data-accion="reintentar">Intentar de nuevo</button>' +
      '<a class="boton boton--secundario" href="#/inicio">Salir y volver más tarde</a></div></div>';
    zona.firstChild.focus();
    return;
  }
  const cita = Object.assign({}, reserva, {
    medico: medicoEfectivo(),
    asignado: reserva.medico === 'cualquiera',
    codigo: 'CC-' + Math.floor(1000 + Math.random() * 9000),
    estado: 'confirmada',
    creada: new Date().toISOString()
  });
  citas.push(cita);
  guardarCitas();
  reserva = reservaVacia();
  guardarReserva();
  location.hash = '#/comprobante/' + cita.codigo;
}

VISTAS.comprobante = {
  titulo: () => 'Cita confirmada',
  html: (r) => {
    const c = citas.find(x => x.codigo === r.arg);
    if (!c) return '<h1>No encontramos ese comprobante</h1><p><a href="#/mis-citas">Ver mis citas</a></p>';
    return '<div class="exito"><h1><span aria-hidden="true">✓ </span>Su cita está confirmada</h1>' +
      '<p>Código de su cita: <span class="codigo">' + c.codigo + '</span></p>' +
      '<p>Llegue 20 minutos antes con su cédula y la orden médica. Le enviamos un recordatorio al celular registrado (simulado).</p></div>' +
      '<section class="tarjeta" aria-label="Detalle de la cita">' + detalleCita(c, false) + '</section>' +
      '<div class="acciones"><button type="button" class="boton boton--primario" data-accion="imprimir">Imprimir comprobante</button>' +
      '<a class="boton boton--secundario" href="#/mis-citas">Ver mis citas</a>' +
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
        '<p>Estado: <span class="insignia insignia--' + c.estado + '">' + (activa ? 'Confirmada' : 'Cancelada') + '</span></p>' +
        '<p>' + esc(c.medico) + ' · ' + esc(sede(c.sede).nombre) + '<br>Código: <strong>' + c.codigo + '</strong></p>' +
        (activa ? '<div class="acciones"><a class="boton boton--secundario" href="#/comprobante/' + c.codigo + '">Ver comprobante<span class="solo-lector"> de ' + esc(esp) + '</span></a>' +
          '<button type="button" class="boton boton--texto" data-accion="cancelar-cita" data-codigo="' + c.codigo + '">Cancelar cita<span class="solo-lector"> de ' + esc(esp) + '</span></button></div>' : '') +
        '</article>';
    }).join('') : '<p>Todavía no tiene citas reservadas.</p><div class="acciones"><a class="boton boton--primario" href="#/paso-1">Reservar cita</a></div>');
  }
};

/* =====================================================================
   NAVEGACIÓN (rutas con #) Y EVENTOS GENERALES
   ===================================================================== */
function leerRuta() {
  const h = location.hash.replace(/^#\/?/, '');
  const [camino, consulta] = h.split('?');
  const [nombre, arg] = (camino || '').split('/');
  return { nombre: nombre || 'inicio', arg: arg || '', q: new URLSearchParams(consulta || '') };
}
function marcarMenu(nombre) {
  const grupo = nombre.startsWith('paso') ? 'paso' : (nombre === 'comprobante' ? 'mis-citas' : nombre);
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
  if (h1) { h1.tabIndex = -1; h1.focus(); }   // al cambiar de pantalla, el foco va al título
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
  if (accion === 'confirmar' || accion === 'reintentar') {
    if (accion === 'reintentar') { $('#acciones-confirmar').hidden = false; }
    confirmarCita();
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
      texto: 'Se cancelará la cita de ' + especialidad(c.especialidad).nombre + ' del ' + fechaLarga(c.fecha) + ' a las ' + c.hora + '. El horario quedará libre para otra persona.',
      seguro: 'No, mantener la cita',
      peligro: 'Sí, cancelar la cita'
    });
    if (ok) { c.estado = 'cancelada'; guardarCitas(); render(); anunciar('La cita ' + c.codigo + ' fue cancelada.'); }
  }
});

/* ---------- Ajustes de lectura: tamaño de letra y contraste (se recuerdan) ---------- */
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

/* ---------- Controles extra del panel del observador ---------- */
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
