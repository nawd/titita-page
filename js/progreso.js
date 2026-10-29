// Progreso en localStorage (todo con try/catch: sin storage, el juego anda igual en memoria)
(function (PP) {
  'use strict';

  PP.Progreso = function (cfg) {
    var clave = 'pasaporte:' + cfg.version;
    var estado = null;
    try { estado = JSON.parse(localStorage.getItem(clave) || 'null'); } catch (e) { estado = null; }
    if (!estado || typeof estado !== 'object') estado = {};
    estado.desafios = estado.desafios || {};
    cfg.desafios.forEach(function (d) {
      estado.desafios[d.id] = Object.assign({ errores: 0, hecho: false }, estado.desafios[d.id]);
    });

    return {
      estado: estado,
      de: function (idDesafio) { return estado.desafios[idDesafio]; },
      guardar: function () {
        try { localStorage.setItem(clave, JSON.stringify(estado)); } catch (e) { /* storage bloqueado */ }
      },
      sellos: function () {
        return cfg.desafios.filter(function (d) { return estado.desafios[d.id].hecho; }).length;
      },
      borrar: function () {
        try { localStorage.removeItem(clave); } catch (e) { /* nada */ }
      },
    };
  };

  // 5 toques rápidos → reset; mantener apretado → callback (lupa)
  PP.gestosLogo = function (el, alResetear, alMantener) {
    var toques = [];
    var timer = null;
    var mantenido = false;
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('pointerdown', function () {
      mantenido = false;
      el.classList.add('apretando');
      timer = setTimeout(function () {
        mantenido = true;
        el.classList.remove('apretando');
        if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) { /* nada */ } }
        alMantener();
      }, 600);
    });
    function soltar() { clearTimeout(timer); el.classList.remove('apretando'); }
    el.addEventListener('pointerup', function () {
      soltar();
      if (mantenido) return;
      var ahora = Date.now();
      toques = toques.filter(function (t) { return ahora - t < 3000; });
      toques.push(ahora);
      if (toques.length >= 5) { toques = []; alResetear(); }
    });
    el.addEventListener('pointerleave', soltar);
    el.addEventListener('pointercancel', soltar);
  };
})(globalThis.PP = globalThis.PP || {});
