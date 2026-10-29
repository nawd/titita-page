// Reglas del juego sin DOM: se testean en Node (tests/run.mjs).
(function (PP) {
  'use strict';

  PP.mensajeError = function (mensajes, n) {
    return mensajes[n % mensajes.length];
  };

  // Pista 1 a los 2 errores, pista 2 a los 4
  PP.pistasVisibles = function (errores) {
    return errores >= 4 ? 2 : errores >= 2 ? 1 : 0;
  };

  PP.tocaFalsaDerrota = function (estado, limite, habilitada) {
    return !!habilitada && !estado.falsaVista && estado.errores >= limite;
  };

  // Vaivén de la lancha en [-1, 1] (0 = pareja con el muelle). Dos senos desfasados
  // para que el bamboleo sea "borracho"; con cada salto se mueve un poco más rápido.
  PP.vaivenLancha = function (t, paso) {
    var f = 0.5 + 0.12 * (paso || 0);
    return 0.62 * Math.sin(2 * Math.PI * f * t) + 0.38 * Math.sin(2 * Math.PI * f * 1.7 * t + 1.3);
  };

  PP.enMuelle = function (vaiven, tolerancia) {
    return Math.abs(vaiven) <= tolerancia;
  };

  // Cerro: un acierto sube un tramo, un error resbala uno
  PP.tramoTras = function (tramo, acierto, total) {
    return acierto ? Math.min(total, tramo + 1) : Math.max(0, tramo - 1);
  };

  // Fracción de píxeles ya limpios (alfa casi 0) en datos RGBA de un canvas,
  // mirando uno de cada `salto` píxeles
  PP.fraccionLimpia = function (datos, salto) {
    var paso = 4 * (salto || 1), limpios = 0, total = 0;
    for (var i = 3; i < datos.length; i += paso) {
      total++;
      if (datos[i] < 32) limpios++;
    }
    return total ? limpios / total : 0;
  };

  PP.mezclar = function (lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  // Mezcla garantizando que no quede en el orden original (para el desafío de ordenar)
  PP.mezclarDistinto = function (lista) {
    if (lista.length < 2) return lista.slice();
    var a;
    do { a = PP.mezclar(lista); } while (a.every(function (x, i) { return x === lista[i]; }));
    return a;
  };

  function letraBase(ch) {
    return ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Busca las letras de `palabra` en orden de lectura a través de varios textos,
  // repartidas a lo largo de todo el texto para que no queden amontonadas.
  // Devuelve [[indiceTexto, indiceCaracter], ...] o null si no entran.
  PP.posicionesPista = function (textos, palabra) {
    var letras = Array.from(letraBase(palabra).replace(/[^a-z0-9]/g, ''));
    var plano = [];
    textos.forEach(function (texto, t) {
      for (var c = 0; c < texto.length; c++) plano.push([t, c, letraBase(texto[c])]);
    });
    var res = [];
    var pos = 0;
    for (var k = 0; k < letras.length; k++) {
      var i = Math.max(pos, Math.floor((k * plano.length) / letras.length));
      while (i < plano.length && plano[i][2] !== letras[k]) i++;
      if (i >= plano.length) return null;
      res.push([plano[i][0], plano[i][1]]);
      pos = i + 1;
    }
    return res;
  };

  // Textos (en orden de lectura) donde se esconden las letras de la pista
  PP.textosPista = function (cfg) {
    return cfg.pistaOculta.textos.map(function (ruta) {
      return ruta.split('.').reduce(function (o, k) { return o && o[k]; }, cfg) || '';
    });
  };

  PP.formatearMonto = function (monto, moneda) {
    var n = Number(monto);
    if (!isFinite(n)) return String(monto);
    return (moneda || '$') + ' ' + n.toLocaleString('es-AR');
  };
})(globalThis.PP = globalThis.PP || {});
