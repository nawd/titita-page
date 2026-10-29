// Cripto liviana del pasaporte: normalización, SHA-256, PBKDF2 + AES-GCM.
// Script clásico (sin módulos) para que funcione igual en index.html, en tools/ con doble clic y en Node.
(function (PP) {
  'use strict';

  var enc = new TextEncoder();
  var dec = new TextDecoder();
  var ITERACIONES = 200000;

  // minúsculas, sin tildes, sin puntuación, espacios colapsados
  PP.normalizar = function (texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  function aB64(bytes) {
    var s = '';
    bytes = new Uint8Array(bytes);
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  function deB64(b64) {
    var s = atob(b64);
    var bytes = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    return bytes;
  }

  function aleatorio(n) {
    return crypto.getRandomValues(new Uint8Array(n));
  }

  PP.hayCripto = function () {
    return !!(globalThis.crypto && crypto.subtle);
  };

  PP.sha256 = async function (texto) {
    var hash = await crypto.subtle.digest('SHA-256', enc.encode(texto));
    return Array.from(new Uint8Array(hash), function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  };

  async function derivarClave(secreto, sal, iteraciones) {
    var base = await crypto.subtle.importKey('raw', enc.encode(secreto), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: sal, iterations: iteraciones, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Devuelve { s: sal, i: iv, c: cifrado, n: iteraciones } en base64
  PP.cifrar = async function (texto, secreto, iteraciones) {
    iteraciones = iteraciones || ITERACIONES;
    var sal = aleatorio(16);
    var iv = aleatorio(12);
    var clave = await derivarClave(secreto, sal, iteraciones);
    var cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, clave, enc.encode(texto));
    return { s: aB64(sal), i: aB64(iv), c: aB64(cifrado), n: iteraciones };
  };

  // Lanza error si el secreto no es el correcto
  PP.descifrar = async function (paquete, secreto) {
    var clave = await derivarClave(secreto, deB64(paquete.s), paquete.n || ITERACIONES);
    var plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(paquete.i) }, clave, deB64(paquete.c));
    return dec.decode(plano);
  };

  // Valor que se hashea para un intento. Los desafíos "order" comparan los ids tal cual.
  PP.valorIntento = function (tipo, intento) {
    return tipo === 'order' ? String(intento) : PP.normalizar(intento);
  };

  // Devuelve la respuesta canónica si el intento es válido, o null.
  // respuestas: [{ h: sha256(valor), w?: paquete con la canónica cifrada con el valor }]
  PP.verificar = async function (respuestas, tipo, intento) {
    var valor = PP.valorIntento(tipo, intento);
    if (!valor) return null;
    var h = await PP.sha256(valor);
    for (var k = 0; k < respuestas.length; k++) {
      var r = respuestas[k];
      if (r.h !== h) continue;
      if (!r.w) return valor;
      try {
        return await PP.descifrar(r.w, valor);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Genera las entradas de respuestas para config.js.
  // canonica: la respuesta "oficial"; variantes: otras formas aceptadas.
  PP.generarRespuestas = async function (tipo, canonica, variantes) {
    var canon = PP.valorIntento(tipo, canonica);
    var vistos = {};
    var lista = [canon].concat((variantes || []).map(function (v) { return PP.valorIntento(tipo, v); }));
    var salida = [];
    for (var k = 0; k < lista.length; k++) {
      var valor = lista[k];
      if (!valor || vistos[valor]) continue;
      vistos[valor] = true;
      var entrada = { h: await PP.sha256(valor) };
      if (valor !== canon) entrada.w = await PP.cifrar(canon, valor, 50000);
      salida.push(entrada);
    }
    return salida;
  };

  PP.secretoFinal = function (canonicas) {
    return canonicas.join('|');
  };

  PP.cifrarFinal = function (datos, canonicas) {
    return PP.cifrar(JSON.stringify(datos), PP.secretoFinal(canonicas));
  };

  PP.descifrarFinal = async function (paquete, canonicas) {
    return JSON.parse(await PP.descifrar(paquete, PP.secretoFinal(canonicas)));
  };
})(globalThis.PP = globalThis.PP || {});
