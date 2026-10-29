// Validación de respuestas en texto plano (están legibles en config.js a propósito).
(function (PP) {
  'use strict';

  // minúsculas, sin tildes, sin puntuación, espacios colapsados
  PP.normalizar = function (texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Valor que se compara para un intento. Los desafíos "order" comparan los ids tal cual.
  PP.valorIntento = function (tipo, intento) {
    return tipo === 'order' ? String(intento) : PP.normalizar(intento);
  };

  // Lo que mandan los juegos sin input (lancha, cerro) al terminarlos
  PP.JUEGO_COMPLETO = 'juego completo';

  // Respuestas válidas de un desafío según su tipo (la primera es la principal)
  PP.respuestasDe = function (d) {
    if (d.tipo === 'lancha' || d.tipo === 'cerro') return [PP.JUEGO_COMPLETO];
    if (d.tipo === 'order') return [(d.ordenCorrecto || []).join('>')];
    if (d.tipo === 'memotest') return [d.palabraClave].concat(d.respuestas || []);
    return d.respuestas || [];
  };

  // Devuelve la respuesta principal (normalizada) si el intento es válido, o null
  PP.verificar = function (d, intento) {
    var valor = PP.valorIntento(d.tipo, intento);
    if (!valor) return null;
    var validas = PP.respuestasDe(d).map(function (v) { return PP.valorIntento(d.tipo, v); });
    return validas.indexOf(valor) >= 0 ? validas[0] : null;
  };
})(globalThis.PP = globalThis.PP || {});
