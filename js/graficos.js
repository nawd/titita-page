// Gráficos generados en SVG: sellos de tinta, guilloché, escudo y logo de la agencia.
(function (PP) {
  'use strict';

  var uid = 0;
  function id(prefijo) { return prefijo + (++uid); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  PP.esc = esc;

  // Filtro de tinta: bordes irregulares + poros donde no agarró la tinta
  function filtroTinta(fid, semilla) {
    return '<filter id="' + fid + '" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="' + semilla + '" result="r"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="r" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="' + (semilla + 7) + '" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 0 0 0 2.25" result="m"/>' +
      '<feComposite in="d" in2="m" operator="in"/>' +
      '</filter>';
  }

  // opciones: { arriba, abajo, centro, sub, color, forma: 'circulo'|'rect'|'oval', semilla }
  PP.selloSVG = function (o) {
    var color = o.color || '#1f3a5f';
    var fid = id('tinta');
    var semilla = o.semilla || Math.floor(Math.random() * 90) + 1;
    var cuerpo;
    if (o.forma === 'rect') {
      cuerpo =
        '<rect x="14" y="44" width="172" height="112" rx="10" fill="none" stroke="' + color + '" stroke-width="7"/>' +
        '<rect x="26" y="56" width="148" height="88" rx="4" fill="none" stroke="' + color + '" stroke-width="2"/>' +
        '<text x="100" y="84" text-anchor="middle" font-family="Special Elite, monospace" font-size="13" fill="' + color + '" letter-spacing="2">' + esc(o.arriba) + '</text>' +
        '<text x="100" y="114" text-anchor="middle" font-family="IM Fell English, serif" font-size="' + (o.centroTam || 28) + '" fill="' + color + '">' + esc(o.centro) + '</text>' +
        '<text x="100" y="134" text-anchor="middle" font-family="Special Elite, monospace" font-size="11" fill="' + color + '" letter-spacing="1.5">' + esc(o.abajo) + '</text>';
    } else {
      var ry = o.forma === 'oval' ? 72 : 90;
      var arriba = id('arr');
      var abajo = id('abj');
      cuerpo =
        '<ellipse cx="100" cy="100" rx="90" ry="' + ry + '" fill="none" stroke="' + color + '" stroke-width="7"/>' +
        '<ellipse cx="100" cy="100" rx="74" ry="' + (ry - 16) + '" fill="none" stroke="' + color + '" stroke-width="2"/>' +
        '<path id="' + arriba + '" d="M 30 100 A 70 ' + (ry - 20) + ' 0 0 1 170 100" fill="none"/>' +
        '<path id="' + abajo + '" d="M 22 100 A 78 ' + (ry - 12) + ' 0 0 0 178 100" fill="none"/>' +
        '<text font-family="Special Elite, monospace" font-size="15" fill="' + color + '" letter-spacing="2.5"><textPath href="#' + arriba + '" startOffset="50%" text-anchor="middle">' + esc(o.arriba) + '</textPath></text>' +
        '<text font-family="Special Elite, monospace" font-size="12" fill="' + color + '" letter-spacing="2"><textPath href="#' + abajo + '" startOffset="50%" text-anchor="middle">' + esc(o.abajo) + '</textPath></text>' +
        '<text x="100" y="' + (o.sub ? 104 : 112) + '" text-anchor="middle" font-family="IM Fell English, serif" font-size="' + (o.centroTam || 34) + '" fill="' + color + '">' + esc(o.centro) + '</text>' +
        (o.sub ? '<text x="100" y="128" text-anchor="middle" font-family="Special Elite, monospace" font-size="11" fill="' + color + '" letter-spacing="1">' + esc(o.sub) + '</text>' : '') +
        '<text x="58" y="106" text-anchor="middle" font-size="12" fill="' + color + '">★</text>' +
        '<text x="142" y="106" text-anchor="middle" font-size="12" fill="' + color + '">★</text>';
    }
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' + filtroTinta(fid, semilla) + '</defs>' +
      '<g filter="url(#' + fid + ')">' + cuerpo + '</g></svg>';
  };

  // Roseta de guilloché (hipotrocoides superpuestas)
  PP.guillocheRoseta = function (tam, color, opacidad) {
    var c = tam / 2;
    var caminos = '';
    var capas = [[0.46, 0.13, 0.2], [0.36, 0.09, 0.15], [0.26, 0.06, 0.1]];
    capas.forEach(function (capa) {
      var R = tam * capa[0], r = tam * capa[1], d = tam * capa[2];
      var pts = [];
      for (var t = 0; t <= Math.PI * 2 * 13; t += 0.02) {
        var x = c + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
        var y = c + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
        pts.push(x.toFixed(1) + ' ' + y.toFixed(1));
      }
      caminos += '<path d="M' + pts.join('L') + '"/>';
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + tam + ' ' + tam + '">' +
      '<g fill="none" stroke="' + color + '" stroke-width="0.5" opacity="' + (opacidad || 0.35) + '">' + caminos + '</g></svg>';
  };

  // Banda de ondas cruzadas, típica de billetes y pasaportes
  PP.guillocheBanda = function (ancho, alto, color, opacidad, lineas) {
    lineas = lineas || 14;
    var caminos = '';
    for (var i = 0; i < lineas; i++) {
      var fase = (i / lineas) * Math.PI * 2;
      var pts = [];
      for (var x = 0; x <= ancho; x += 3) {
        var y = alto / 2 + Math.sin(x / 22 + fase) * (alto * 0.32) + Math.sin(x / 7 + fase * 2) * (alto * 0.06);
        pts.push(x + ' ' + y.toFixed(1));
      }
      caminos += '<path d="M' + pts.join('L') + '"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ancho + ' ' + alto + '" preserveAspectRatio="none">' +
      '<g fill="none" stroke="' + color + '" stroke-width="0.45" opacity="' + (opacidad || 0.3) + '">' + caminos + '</g></svg>';
  };

  PP.svgComoUrl = function (svg) {
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };

  // Escudo de la agencia: globo con meridianos, corazón y laureles
  PP.escudoSVG = function (color) {
    color = color || '#e3c88a';
    var hojas = '';
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (0.62 + i * 0.075);
      var x = 60 + Math.cos(a) * 50, y = 62 + Math.sin(a) * 50;
      var x2 = 120 - x;
      var rot = (a * 180) / Math.PI + 90;
      hojas += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="3" ry="7" transform="rotate(' + rot.toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      hojas += '<ellipse cx="' + x2.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="3" ry="7" transform="rotate(' + (-rot).toFixed(0) + ' ' + x2.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return '<svg class="escudo" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g fill="none" stroke="' + color + '" stroke-width="1.6">' +
      '<circle cx="60" cy="56" r="32"/>' +
      '<ellipse cx="60" cy="56" rx="14" ry="32"/><ellipse cx="60" cy="56" rx="26" ry="32"/>' +
      '<path d="M28 56h64M32 40h56M32 72h56"/>' +
      '</g>' +
      '<path d="M60 70 C48 60 46 52 52 48 C56 45 60 48 60 52 C60 48 64 45 68 48 C74 52 72 60 60 70Z" fill="' + color + '"/>' +
      '<g fill="' + color + '">' + hojas + '</g>' +
      '<path d="M44 104 L60 98 L76 104" fill="none" stroke="' + color + '" stroke-width="1.6"/>' +
      '</svg>';
  };

  // Dos gatitos sentados (uno azul, uno bordó) con las colas armando un corazón
  PP.gatitosSVG = function () {
    function gato(color, ojosAbiertos) {
      var ojos = ojosAbiertos
        ? '<circle cx="44.5" cy="45.5" r="1.6" fill="' + color + '"/><circle cx="55.5" cy="45.5" r="1.6" fill="' + color + '"/>'
        : '<path d="M42 46 Q44.5 43.5 47 46 M53 46 Q55.5 43.5 58 46"/>';
      return '<g stroke="' + color + '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M67 92 C74 92 78 86 80 76 C76 70 68 64 68 57 C68 51 76 49 80 55" fill="none"/>' +
        '<path d="M38 57 C30 66 29 86 32 96 L68 96 C71 86 70 66 62 57Z" fill="#f6f3e8"/>' +
        '<path d="M42 96 Q44.5 91 47 96 M53 96 Q55.5 91 58 96" fill="none"/>' +
        '<path d="M35 46 C35 38 37 34 38 27 L46 33 C48 32.5 52 32.5 54 33 L62 27 C63 34 65 38 65 46 C65 54 58 59 50 59 C42 59 35 54 35 46Z" fill="#f6f3e8"/>' +
        '<path d="M39.5 30.5 L41 35 M60.5 30.5 L59 35" stroke-width="0.9"/>' +
        '<g fill="none">' + ojos +
        '<path d="M50 51 Q48.5 53.5 46.5 52.5 M50 51 Q51.5 53.5 53.5 52.5"/>' +
        '<path d="M38 50 L30 49 M38 52.5 L30.5 54.5 M62 50 L70 49 M62 52.5 L69.5 54.5" stroke-width="0.8"/></g>' +
        '<path d="M48.6 49.3 L51.4 49.3 L50 51Z" fill="' + color + '"/>' +
        '<ellipse cx="41" cy="51" rx="2.2" ry="1.2" fill="#c97a86" stroke="none" opacity="0.45"/>' +
        '<ellipse cx="59" cy="51" rx="2.2" ry="1.2" fill="#c97a86" stroke="none" opacity="0.45"/>' +
        '</g>';
    }
    return '<svg class="gatitos" viewBox="24 22 112 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      gato('#1f3a5f', false) +
      '<g transform="translate(160 0) scale(-1 1)">' + gato('#7a1f2b', true) + '</g>' +
      '</svg>';
  };

  // Logo circular de la agencia (header)
  PP.logoSVG = function () {
    var p = id('logo');
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="47" fill="#7a1f2b" stroke="#c9a45c" stroke-width="2"/>' +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="#c9a45c" stroke-width="1"/>' +
      '<path id="' + p + '" d="M 50 50 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" fill="none"/>' +
      '<text font-family="Special Elite, monospace" font-size="9.5" fill="#e3c88a" letter-spacing="1.6"><textPath href="#' + p + '">TURISMO BOMBONES · DESDE SIEMPRE ·</textPath></text>' +
      '<text x="50" y="58" text-anchor="middle" font-family="IM Fell English, serif" font-size="24" fill="#e3c88a">TB</text>' +
      '</svg>';
  };
})(globalThis.PP = globalThis.PP || {});
