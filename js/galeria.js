// Galería del final: crossfade automático, swipe y puntos de navegación.
(function (PP) {
  'use strict';

  PP.Galeria = function (contenedor, fotos, intervalo) {
    var esc = PP.esc;
    var caja = document.createElement('div');
    caja.className = 'galeria';
    caja.setAttribute('role', 'region');
    caja.setAttribute('aria-roledescription', 'carrusel');
    caja.setAttribute('aria-label', 'Fotos del próximo viaje');
    caja.innerHTML = fotos.map(function (f, i) {
      return '<figure' + (i === 0 ? ' class="activa"' : '') + ' aria-hidden="' + (i !== 0) + '">' +
        '<img alt="' + esc(f.pie || '') + '" src="' + esc(f.src) + '"' + (i > 1 ? ' loading="lazy"' : '') + '>' +
        (f.pendiente ? '<span class="pendiente">📷 foto pendiente</span>' : '') +
        (f.pie ? '<figcaption>' + esc(f.pie) + '</figcaption>' : '') +
        '</figure>';
    }).join('');
    var puntos = document.createElement('div');
    puntos.className = 'puntos';
    puntos.innerHTML = fotos.map(function (f, i) {
      return '<button type="button" aria-label="Foto ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>';
    }).join('');
    contenedor.appendChild(caja);
    contenedor.appendChild(puntos);

    var actual = 0;
    var timer = null;
    var figuras = caja.querySelectorAll('figure');
    var botones = puntos.querySelectorAll('button');

    function ir(n) {
      figuras[actual].classList.remove('activa');
      figuras[actual].setAttribute('aria-hidden', 'true');
      botones[actual].removeAttribute('aria-current');
      actual = (n + fotos.length) % fotos.length;
      figuras[actual].classList.add('activa');
      figuras[actual].setAttribute('aria-hidden', 'false');
      botones[actual].setAttribute('aria-current', 'true');
      programar();
    }
    function programar() {
      clearTimeout(timer);
      timer = setTimeout(function () { if (!document.hidden) ir(actual + 1); else programar(); }, intervalo || 4200);
    }

    puntos.addEventListener('click', function (e) {
      var i = Array.prototype.indexOf.call(botones, e.target.closest('button'));
      if (i >= 0) ir(i);
    });
    var x0 = null;
    caja.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    caja.addEventListener('pointerup', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) ir(actual + (dx < 0 ? 1 : -1));
      else ir(actual + 1);
    });
    programar();
  };
})(globalThis.PP = globalThis.PP || {});
