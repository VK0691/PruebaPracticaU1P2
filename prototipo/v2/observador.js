'use strict';
/* Panel del observador (solo para la prueba con usuarios).
   Se abre con ?observador=1 en la dirección o con la tecla F2.
   Mide de forma REAL: tiempo de la tarea, errores de validación, errores del sistema
   y pausas de más de 8 segundos sin interacción. No envía nada a internet. */

window.Observador = (function () {
  const UMBRAL_PAUSA_MS = 8000;
  const params = new URLSearchParams(location.search);
  let panel = null;
  let inicio = null;
  let fin = null;
  let ultimaInteraccion = null;
  let errores = 0;
  let erroresSistema = 0;
  let pausas = 0;
  let completada = false;
  let registro = [];
  let reloj = null;
  const controlesExtra = [];

  function ahora() { return Date.now(); }
  function mmss(ms) {
    const s = Math.round(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function enCurso() { return inicio !== null && fin === null; }

  function anotar(texto) {
    if (!enCurso()) return;
    registro.push(mmss(ahora() - inicio) + '  ' + texto);
    actualizar();
  }

  function evento(tipo, detalle) {
    if (!enCurso()) return;
    if (tipo === 'error-validacion') { errores++; anotar('Error de validación: ' + detalle); return; }
    if (tipo === 'error-sistema') { erroresSistema++; anotar('Error del sistema: ' + detalle); return; }
    if (tipo === 'tarea-completada') {
      completada = true;
      anotar('TAREA COMPLETADA ' + (detalle || ''));
      fin = ahora();
      actualizar();
      return;
    }
    anotar(detalle ? tipo + ': ' + detalle : tipo);
  }

  function interaccion(e) {
    if (panel && panel.contains(e.target)) return;
    if (!enCurso()) return;
    const t = ahora();
    if (ultimaInteraccion !== null && t - ultimaInteraccion > UMBRAL_PAUSA_MS) {
      pausas++;
      registro.push(mmss(ultimaInteraccion - inicio) + '  Pausa de ' + Math.round((t - ultimaInteraccion) / 1000) + ' s');
    }
    ultimaInteraccion = t;
  }

  function resumenTexto() {
    const total = inicio ? (fin || ahora()) - inicio : 0;
    return [
      'Prueba · ' + document.title,
      'Fecha: ' + new Date().toLocaleString('es-EC'),
      'Tiempo de la tarea: ' + mmss(total) + (fin ? '' : ' (en curso)'),
      'Tarea completada: ' + (completada ? 'Sí' : 'No'),
      'Errores de validación: ' + errores,
      'Errores del sistema: ' + erroresSistema,
      'Pausas de más de 8 s: ' + pausas,
      'Registro:',
      ...registro.map(l => '  ' + l)
    ].join('\n');
  }

  function actualizar() {
    if (!panel) return;
    const total = inicio ? (fin || ahora()) - inicio : 0;
    panel.querySelector('[data-obs="tiempo"]').textContent = mmss(total);
    panel.querySelector('[data-obs="estado"]').textContent = inicio === null ? 'sin iniciar' : (fin ? (completada ? 'completada' : 'detenida') : 'en curso');
    panel.querySelector('[data-obs="errores"]').textContent = errores;
    panel.querySelector('[data-obs="sistema"]').textContent = erroresSistema;
    panel.querySelector('[data-obs="pausas"]').textContent = pausas;
    const lista = panel.querySelector('[data-obs="registro"]');
    lista.innerHTML = registro.slice(-30).map(l => '<li>' + l.replace(/</g, '&lt;') + '</li>').join('');
  }

  function iniciarTarea() {
    inicio = ahora(); fin = null; ultimaInteraccion = inicio;
    errores = 0; erroresSistema = 0; pausas = 0; completada = false; registro = [];
    anotar('Inicio de la tarea');
    clearInterval(reloj);
    reloj = setInterval(actualizar, 500);
  }

  function detenerTarea() {
    if (!enCurso()) return;
    anotar('Tarea detenida por el observador (no completada)');
    fin = ahora();
    actualizar();
  }

  function copiar() {
    const texto = resumenTexto();
    const salida = panel.querySelector('[data-obs="salida"]');
    salida.hidden = false;
    salida.value = texto;
    salida.select();
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(texto).catch(() => document.execCommand('copy'));
      else document.execCommand('copy');
    } catch (e) { /* el texto queda seleccionado para copiarlo a mano */ }
  }

  function crearPanel() {
    if (panel) return;
    panel = document.createElement('aside');
    panel.id = 'observador';
    panel.setAttribute('aria-label', 'Panel del observador');
    panel.innerHTML = `
      <h2>Panel del observador (F2)</h2>
      <button type="button" data-obs-accion="ocultar">Ocultar</button>
      <button type="button" data-obs-accion="iniciar">Iniciar tarea</button>
      <button type="button" data-obs-accion="detener">Detener</button>
      <dl>
        <dt>Estado</dt><dd data-obs="estado">sin iniciar</dd>
        <dt>Tiempo</dt><dd data-obs="tiempo">00:00</dd>
        <dt>Err. validación</dt><dd data-obs="errores">0</dd>
        <dt>Err. sistema</dt><dd data-obs="sistema">0</dd>
        <dt>Pausas &gt; 8 s</dt><dd data-obs="pausas">0</dd>
      </dl>
      <div data-obs="extra"></div>
      <button type="button" data-obs-accion="copiar">Copiar resultados</button>
      <button type="button" data-obs-accion="borrar">Borrar datos del prototipo</button>
      <textarea data-obs="salida" rows="6" style="width:100%" hidden aria-label="Resultados"></textarea>
      <strong>Registro</strong>
      <ol data-obs="registro"></ol>`;
    document.body.appendChild(panel);
    panel.addEventListener('click', (e) => {
      const accion = e.target.getAttribute('data-obs-accion');
      if (accion === 'iniciar') iniciarTarea();
      if (accion === 'detener') detenerTarea();
      if (accion === 'copiar') copiar();
      if (accion === 'ocultar') panel.hidden = true;
      if (accion === 'borrar') {
        try { localStorage.clear(); sessionStorage.clear(); } catch (err) { /* sin almacenamiento */ }
        location.hash = '#/inicio';
        location.reload();
      }
    });
    const extra = panel.querySelector('[data-obs="extra"]');
    controlesExtra.forEach(c => { extra.insertAdjacentHTML('beforeend', c.html); if (c.montar) c.montar(extra); });
    actualizar();
  }

  function alternarPanel() {
    if (!panel) { crearPanel(); return; }
    panel.hidden = !panel.hidden;
  }

  function agregarControl(html, montar) {
    controlesExtra.push({ html, montar });
    if (panel) {
      const extra = panel.querySelector('[data-obs="extra"]');
      extra.insertAdjacentHTML('beforeend', html);
      if (montar) montar(extra);
    }
  }

  ['keydown', 'pointerdown', 'input'].forEach(t => document.addEventListener(t, interaccion, true));
  document.addEventListener('keydown', (e) => { if (e.key === 'F2') { e.preventDefault(); alternarPanel(); } });
  if (params.has('observador')) document.addEventListener('DOMContentLoaded', crearPanel);

  return { evento, agregarControl };
})();
