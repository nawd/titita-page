// Cheque de viajero de la agencia. Se usa en la pantalla final y en cheque.html (impresión).
// Medidas en unidades cqw: el mismo diseño escala a 343px en el celu o a 20cm en papel.
(function (PP) {
  'use strict';

  var esc = function (s) { return PP.esc(s); };

  // Microtexto en SVG: no lo afecta el tamaño mínimo de fuente del navegador al imprimir
  function microtexto(texto, unidades, color) {
    var bloque = (texto + ' · ').toUpperCase();
    var porChar = 17 * 0.6;
    var reps = Math.ceil(unidades / (bloque.length * porChar)) + 1;
    return '<svg class="micro" viewBox="0 0 ' + unidades + ' 20" preserveAspectRatio="xMinYMid slice" aria-hidden="true">' +
      '<text x="0" y="15" font-family="Courier Prime, Courier New, monospace" font-size="17" fill="' + color + '" textLength="' + (reps * bloque.length * porChar).toFixed(0) + '" lengthAdjust="spacing">' +
      esc(new Array(reps + 1).join(bloque)) + '</text></svg>';
  }

  // op: { monto, qr (svg), conPlantilla }
  PP.chequeHTML = function (cfg, op) {
    op = op || {};
    var ch = cfg.cheque;
    var fondo = PP.svgComoUrl(PP.guillocheRoseta(400, '#2f5480', 0.28));
    var banda = PP.svgComoUrl(PP.guillocheBanda(600, 60, '#7a1f2b', 0.35, 18));
    return '<div class="cheque-marco"><div class="cheque" style="--fondo:' + fondo.replace(/"/g, "'") + ';--banda:' + banda.replace(/"/g, "'") + '">' +
      '<div class="ch-micro-borde arriba">' + microtexto(cfg.agencia + ' · ' + ch.leyenda, 3300, '#2f5480') + '</div>' +
      '<div class="ch-micro-borde abajo">' + microtexto(cfg.agencia + ' · ' + cfg.fecha, 3300, '#2f5480') + '</div>' +
      '<header class="ch-cab">' +
        '<div class="ch-banco"><span class="ch-logo">' + PP.logoSVG() + '</span>' +
          '<div><b>' + esc(cfg.agencia) + '</b><small>Agencia de viajes · Sucursal Corazón</small></div></div>' +
        '<div class="ch-num">Cheque de viajero N° <b>' + esc(cfg.numeroCheque) + '</b><small>Fecha: ' + esc(cfg.fecha) + '</small></div>' +
      '</header>' +
      '<div class="ch-cuerpo">' +
        '<div class="ch-linea"><span>Páguese a</span><b class="ch-nombre">' + esc(cfg.nombre) + '</b></div>' +
        '<div class="ch-monto"><span>$</span><b class="ch-valor">' + esc(op.monto || '????') + '</b></div>' +
        '<div class="ch-linea ch-suma"><span>La suma de</span><i>una valija llena de viajes</i></div>' +
      '</div>' +
      '<footer class="ch-pie">' +
        (op.qr ? '<div class="ch-qr">' + op.qr + '<small>Escaneá para cobrar</small></div>' : '<div class="ch-qr vacio"></div>') +
        '<div class="ch-leyenda">' + esc(ch.leyenda) + '</div>' +
        '<div class="ch-firma"><div class="ch-firma-espacio"></div>' + microtexto(ch.microtexto, 1000, '#1f3a5f') + '<small>Firma autorizada · ' + esc(cfg.autor) + '</small></div>' +
      '</footer>' +
      '<div class="ch-micr">⑆' + esc(cfg.numeroCheque) + '⑆ 0004 ⑈ ' + esc(cfg.fecha.slice(-4)) + '⑉</div>' +
      '<div class="ch-sello"></div>' +
      '</div></div>';
  };
})(globalThis.PP = globalThis.PP || {});
