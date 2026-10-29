// Renderers por tipo de desafío. Cada uno arma su "zona" y usa la api común:
//   api.intentar(valor) → Promise<bool>   (valida, sella o cuenta error)
//   api.errorSilencioso()                  (suma error sin mensaje, ej. memotest)
//   api.mostrarFormulario()                (aparece el input de respuesta)
// Devuelven { conFormulario, actualizar? }
(function (PP) {
  'use strict';

  var esc = function (s) { return PP.esc(s); };
  PP.Desafios = {};

  // ---------- Foto blureada ----------
  // Una o varias rondas (d.rondas); cada una se aclara con los errores de esa ronda.
  PP.Desafios.blur = function (zona, d, est, api) {
    zona.innerHTML = '<figure class="foto-blur"><img alt="Foto misteriosa de un lugar"><figcaption></figcaption></figure>';
    var img = zona.querySelector('img');
    var cap = zona.querySelector('figcaption');
    var rondas = d.rondas || [{ imagenes: d.imagenes }];
    var mostrando = null; // ronda recién acertada: se ve nítida un momento antes de pasar a la siguiente

    function ronda() { return rondas[Math.min(est.ronda || 0, rondas.length - 1)]; }

    function actualizar() {
      var r = mostrando || ronda();
      var total = r.imagenes.length;
      var nitida = est.hecho || !!mostrando;
      var n = nitida ? total - 1 : Math.min(PP.erroresRonda(est), total - 2);
      if (img.getAttribute('src') !== r.imagenes[n]) img.src = r.imagenes[n];
      var numero = rondas.length > 1 ? 'Foto ' + (rondas.indexOf(r) + 1) + ' de ' + rondas.length + ' · ' : '';
      cap.textContent = nitida ? numero + (r.pie || '¡Nítida!') : numero + 'Desenfoque nivel ' + (total - 1 - n);
      if (!nitida && n + 1 < total - 1) new Image().src = r.imagenes[n + 1];
    }

    // Respuesta correcta: si quedan rondas, avanza y devuelve el mensaje; si era la última, null (se sella)
    function acierto() {
      var k = Math.min(est.ronda || 0, rondas.length - 1);
      if (k >= rondas.length - 1) return null;
      mostrando = rondas[k];
      est.ronda = k + 1;
      est.baseRonda = est.errores;
      api.guardar();
      new Image().src = rondas[k + 1].imagenes[0];
      actualizar();
      setTimeout(function () { mostrando = null; actualizar(); }, PP.reducirMovimiento() ? 900 : 2200);
      return '¡Sí! ' + (mostrando.pie ? mostrando.pie + '. ' : '') + 'Ahí va la siguiente foto…';
    }

    actualizar();
    return { conFormulario: true, actualizar: actualizar, acierto: acierto };
  };

  // ---------- Memotest ----------
  PP.Desafios.memotest = function (zona, d, est, api) {
    function mostrarPalabra(animar) {
      var p = document.createElement('div');
      p.className = 'palabra-clave' + (animar ? ' revela' : '');
      p.innerHTML = 'La agencia te dicta la palabra clave:<b>' + esc(d.palabraClave) + '</b>';
      zona.appendChild(p);
      api.mostrarFormulario();
    }

    var grilla = document.createElement('div');
    grilla.className = 'memo';
    zona.appendChild(grilla);

    var cartas = PP.mezclar(d.cartas.concat(d.cartas).map(function (src, i) {
      return { src: src, par: i % d.cartas.length };
    }));
    var abiertas = [];
    var bloqueado = false;
    var pares = 0;

    cartas.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carta' + (est.memoCompleto ? ' par' : '');
      b.setAttribute('aria-label', 'Carta ' + (i + 1));
      b.innerHTML = '<span class="cara dorso">♥</span><span class="cara frente"><img alt="" src="' + esc(c.src) + '" loading="lazy"></span>';
      b.addEventListener('click', function () {
        if (bloqueado || est.memoCompleto || b.classList.contains('vuelta') || b.classList.contains('par')) return;
        b.classList.add('vuelta');
        abiertas.push({ b: b, c: c });
        if (abiertas.length < 2) return;
        var a = abiertas[0], z = abiertas[1];
        abiertas = [];
        if (a.c.par === z.c.par) {
          a.b.classList.add('par'); z.b.classList.add('par');
          a.b.classList.remove('vuelta'); z.b.classList.remove('vuelta');
          pares++;
          if (pares === d.cartas.length) {
            est.memoCompleto = true;
            api.guardar();
            PP.confeti({ cantidad: 40, y: 0.45, fuerza: 0.7 });
            setTimeout(function () { mostrarPalabra(true); }, 500);
          }
        } else {
          bloqueado = true;
          setTimeout(function () {
            a.b.classList.remove('vuelta'); z.b.classList.remove('vuelta');
            bloqueado = false;
            api.errorSilencioso();
          }, 850);
        }
      });
      grilla.appendChild(b);
    });

    if (est.memoCompleto) mostrarPalabra(false);
    return { conFormulario: !!est.memoCompleto };
  };

  // ---------- Ordenar sellos ----------
  PP.Desafios.order = function (zona, d, est, api) {
    var porId = {};
    d.sellos.forEach(function (s) { porId[s.id] = s; });
    var orden = est.hecho
      ? (d.ordenCorrecto || []).map(function (idS) { return porId[idS]; }).filter(Boolean)
      : PP.mezclarDistinto(d.sellos);

    var lista = document.createElement('ol');
    lista.className = 'lista-orden' + (d.sellos.length > 5 ? ' compacta' : '');
    zona.appendChild(lista);

    var colores = ['#1f3a5f', '#7a1f2b', '#2f6b45', '#5b3a7a', '#8a5a1f', '#2f5480', '#9b2c3a'];
    orden.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'item-orden';
      li.dataset.id = s.id;
      var mini = s.imagen
        ? '<img alt="" src="' + esc(s.imagen) + '">'
        : PP.selloSVG({ arriba: s.nombre.toUpperCase(), abajo: '', centro: '✈', centroTam: 40, color: colores[d.sellos.indexOf(s) % colores.length] });
      li.innerHTML =
        '<span class="agarre" aria-hidden="true">⠿</span>' +
        '<span class="mini">' + mini + '</span>' +
        '<span class="nombre">' + esc(s.nombre) + (s.anio ? '<small>' + esc(s.anio) + '</small>' : '') + '</span>' +
        '<span class="flechas">' +
        '<button type="button" data-mover="-1" aria-label="Subir ' + esc(s.nombre) + '">▲</button>' +
        '<button type="button" data-mover="1" aria-label="Bajar ' + esc(s.nombre) + '">▼</button>' +
        '</span>';
      lista.appendChild(li);
      arrastrable(li, lista);
    });

    lista.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mover]');
      if (!b || est.hecho) return;
      var li = b.closest('li');
      if (b.dataset.mover === '-1' && li.previousElementSibling) lista.insertBefore(li, li.previousElementSibling);
      if (b.dataset.mover === '1' && li.nextElementSibling) lista.insertBefore(li.nextElementSibling, li);
      b.focus();
    });

    var validar = document.createElement('button');
    validar.type = 'button';
    validar.className = 'boton tinta ancho';
    validar.textContent = 'Validar orden';
    validar.hidden = !!est.hecho;
    zona.appendChild(validar);
    validar.addEventListener('click', function () {
      var ids = Array.from(lista.children).map(function (li) { return li.dataset.id; });
      validar.disabled = true;
      api.intentar(ids.join('>'), lista).then(function (ok) {
        validar.disabled = false;
        if (ok) validar.hidden = true;
      });
    });

    function arrastrable(li) {
      var inicioY = 0, activo = false, idPuntero = null;
      li.addEventListener('pointerdown', function (e) {
        if (est.hecho || e.target.closest('button')) return;
        activo = true;
        idPuntero = e.pointerId;
        inicioY = e.clientY;
        li.setPointerCapture(e.pointerId);
        li.classList.add('arrastrando');
      });
      li.addEventListener('pointermove', function (e) {
        if (!activo || e.pointerId !== idPuntero) return;
        // Puede pasar por encima de varios sellos en un solo movimiento rápido
        for (;;) {
          var dy = e.clientY - inicioY;
          var sig = li.nextElementSibling, ant = li.previousElementSibling;
          if (dy > 0 && sig && dy > sig.offsetHeight / 2 + 4) {
            lista.insertBefore(sig, li);
            inicioY += sig.offsetHeight + 8;
          } else if (dy < 0 && ant && -dy > ant.offsetHeight / 2 + 4) {
            lista.insertBefore(li, ant);
            inicioY -= ant.offsetHeight + 8;
          } else break;
        }
        li.style.transform = 'translateY(' + (e.clientY - inicioY) + 'px)';
      });
      function fin() {
        if (!activo) return;
        activo = false;
        li.classList.remove('arrastrando');
        li.style.transform = '';
      }
      li.addEventListener('pointerup', fin);
      li.addEventListener('pointercancel', fin);
    }

    return { conFormulario: false };
  };

  // ---------- Bajarse de la lancha ----------
  // La lancha se bambolea; hay que saltar cuando queda pareja con el muelle.
  PP.Desafios.lancha = function (zona, d, est, api) {
    var etapas = d.etapas || ['', '', ''];
    var total = etapas.length;
    var tolerancia = d.tolerancia || 0.18;
    var splashes = d.mensajesSplash && d.mensajesSplash.length ? d.mensajesSplash : ['¡Splash!'];
    est.paso = est.hecho ? total : (est.paso || 0);

    zona.innerHTML =
      '<div class="lancha">' +
        '<svg class="lancha-escena" viewBox="0 0 320 180" aria-hidden="true">' +
          '<path class="agua-fondo" d="M0 112 H320 V180 H0Z"/>' +
          '<g class="muelle"><rect x="226" y="96" width="94" height="9" rx="1"/>' +
            '<rect x="236" y="105" width="6" height="60"/><rect x="290" y="105" width="6" height="60"/>' +
            '<path class="marca" d="M222 96 H232"/></g>' +
          '<g class="bote"><path class="casco" d="M24 96 H222 L206 126 Q120 138 40 126Z"/>' +
            '<path class="borda" d="M24 96 H222"/>' +
            '<rect class="cabina" x="56" y="74" width="54" height="22" rx="4"/>' +
            '<rect class="vidrio" x="64" y="79" width="16" height="10" rx="2"/><rect class="vidrio" x="86" y="79" width="16" height="10" rx="2"/></g>' +
          '<g class="titita"><circle cx="0" cy="-30" r="7"/><path d="M0 -23 V-8 M0 -19 L-8 -12 M0 -19 L9 -24 M0 -8 L-6 4 M0 -8 L6 4"/></g>' +
          '<g class="gotas"><circle cx="216" cy="118" r="3"/><circle cx="226" cy="108" r="2.5"/><circle cx="208" cy="106" r="2"/><circle cx="232" cy="120" r="2"/></g>' +
          '<path class="ola" d="M0 116 Q20 110 40 116 T80 116 T120 116 T160 116 T200 116 T240 116 T280 116 T320 116 V180 H0Z"/>' +
        '</svg>' +
        '<p class="lancha-etapa"></p>' +
        '<button type="button" class="boton ancho lancha-saltar">¡Saltá!</button>' +
        '<p class="feedback lancha-splash" aria-live="polite"></p>' +
      '</div>';
    var escena = zona.querySelector('.lancha-escena');
    var bote = zona.querySelector('.bote');
    var titita = zona.querySelector('.titita');
    var etapa = zona.querySelector('.lancha-etapa');
    var saltar = zona.querySelector('.lancha-saltar');
    var splash = zona.querySelector('.lancha-splash');

    // De la cabina a tierra firme, un tramo por salto
    function xTitita() { return 130 + (300 - 130) * est.paso / total; }

    function pintar() {
      var listo = est.paso >= total;
      zona.querySelector('.lancha').style.setProperty('--mareo', ((total - est.paso) / total).toFixed(2));
      etapa.textContent = listo ? etapas[total - 1] || '¡En tierra firme!' : 'Salto ' + (est.paso + 1) + ' de ' + total + (etapas[est.paso] ? ' · ' + etapas[est.paso] : '');
      saltar.hidden = listo;
    }

    var t0 = performance.now();
    var lento = PP.reducirMovimiento() ? 0.5 : 1;
    var vaiven = 0;
    function cuadro(ahora) {
      // La pantalla del desafío se rearma al volver: si ya no se ve, este loop termina
      if (!zona.isConnected || !zona.offsetParent) return;
      vaiven = PP.vaivenLancha(((ahora - t0) / 1000) * lento, Math.min(est.paso, total - 1));
      var y = vaiven * 22;
      bote.setAttribute('transform', 'translate(0 ' + y.toFixed(1) + ') rotate(' + (vaiven * 5).toFixed(1) + ' 120 110)');
      var x = xTitita();
      titita.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + (x < 222 ? 96 + y : 96).toFixed(1) + ')');
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);

    saltar.addEventListener('click', function () {
      if (est.hecho || est.paso >= total) return;
      if (PP.enMuelle(vaiven, tolerancia)) {
        est.paso++;
        api.guardar();
        splash.textContent = '';
        pintar();
        if (est.paso >= total) api.intentar(PP.JUEGO_COMPLETO);
        return;
      }
      splash.textContent = PP.mensajeError(splashes, est.errores);
      escena.classList.remove('salpica');
      void escena.getBoundingClientRect();
      escena.classList.add('salpica');
      PP.temblar(saltar);
      api.errorSilencioso();
    });

    pintar();
    return { conFormulario: false, actualizar: pintar };
  };

  // ---------- Subir el cerro ----------
  // Preguntas de opción múltiple: acierto = un tramo más arriba, error = resbalón.
  PP.Desafios.cerro = function (zona, d, est, api) {
    var preguntas = d.preguntas || [];
    var total = preguntas.length;
    est.tramo = est.hecho ? total : Math.min(est.tramo || 0, total);

    // Hitos del sendero en zigzag, de la base (k = 0) a la cumbre (k = total)
    var hitos = [];
    for (var k = 0; k <= total; k++) {
      var f = k / total;
      hitos.push({ x: k === total ? 168 : 168 + (k % 2 ? 46 : -54) * (1 - f), y: 186 - 142 * f });
    }
    var sendero = hitos.map(function (h, i) { return (i ? 'L' : 'M') + h.x.toFixed(1) + ' ' + h.y.toFixed(1); }).join(' ');
    var cumbre = hitos[total];

    zona.innerHTML =
      '<div class="cerro">' +
        '<svg class="cerro-escena" viewBox="0 0 320 200" aria-hidden="true">' +
          '<path class="lejos" d="M0 200 L40 130 L80 160 L130 90 L190 150 L250 70 L320 140 V200Z"/>' +
          '<path class="monte" d="M0 200 L60 150 L100 162 L168 40 L214 96 L246 82 L320 200Z"/>' +
          '<path class="nieve" d="M168 40 L184 60 L174 56 L166 64 L158 56 L150 62Z"/>' +
          '<path class="sendero" d="' + sendero + '"/>' +
          hitos.map(function (h, i) {
            return '<circle class="hito" cx="' + h.x.toFixed(1) + '" cy="' + h.y.toFixed(1) + '" r="' + (i === total ? 0 : 4) + '"/>';
          }).join('') +
          '<g class="bandera" transform="translate(' + cumbre.x + ' ' + cumbre.y + ')"><path d="M0 0 V-24"/><path class="tela" d="M0 -24 L18 -19 L0 -14Z"/></g>' +
          '<g class="escalador"><circle cx="0" cy="-16" r="5"/><path d="M0 -11 V-3 M0 -9 L-5 -5 M0 -9 L5 -6 M0 -3 L-4 4 M0 -3 L4 4"/></g>' +
        '</svg>' +
        '<p class="cerro-altura"></p>' +
        '<div class="cerro-pregunta"><p class="cerro-texto"></p><div class="cerro-opciones"></div></div>' +
        '<p class="feedback cerro-msj" aria-live="polite"></p>' +
      '</div>';
    var escalador = zona.querySelector('.escalador');
    var altura = zona.querySelector('.cerro-altura');
    var tarjeta = zona.querySelector('.cerro-pregunta');
    var texto = zona.querySelector('.cerro-texto');
    var opciones = zona.querySelector('.cerro-opciones');
    var msj = zona.querySelector('.cerro-msj');
    var nombreCerro = d.cerro || 'el cerro';

    function pintar() {
      var h = hitos[est.tramo];
      escalador.style.transform = 'translate(' + h.x.toFixed(1) + 'px,' + h.y.toFixed(1) + 'px)';
      var arriba = est.tramo >= total;
      altura.textContent = arriba ? 'Cumbre · ' + nombreCerro : 'Tramo ' + (est.tramo + 1) + ' de ' + total;
      tarjeta.hidden = arriba;
      if (arriba) return;
      var p = preguntas[est.tramo];
      texto.textContent = p.pregunta;
      opciones.innerHTML = PP.mezclar(p.opciones.map(function (o, i) { return i; })).map(function (i) {
        return '<button type="button" class="opcion" data-i="' + i + '">' + esc(p.opciones[i]) + '</button>';
      }).join('');
    }

    opciones.addEventListener('click', function (e) {
      var b = e.target.closest('.opcion');
      if (!b || est.hecho || opciones.classList.contains('ocupado')) return;
      var acierto = +b.dataset.i === preguntas[est.tramo].correcta;
      opciones.classList.add('ocupado');
      b.classList.add(acierto ? 'bien' : 'mal');
      est.tramo = PP.tramoTras(est.tramo, acierto, total);
      if (acierto) {
        msj.className = 'feedback ok cerro-msj';
        msj.textContent = est.tramo >= total ? '¡Cumbre!' : '¡Arriba! Un tramo más.';
        api.guardar();
      } else {
        msj.className = 'feedback cerro-msj';
        msj.textContent = '¡Resbalón! Bajás un tramo.';
        PP.temblar(tarjeta);
        api.errorSilencioso();
      }
      setTimeout(function () {
        opciones.classList.remove('ocupado');
        pintar();
        if (est.tramo >= total) api.intentar(PP.JUEGO_COMPLETO);
      }, PP.reducirMovimiento() ? 300 : 900);
    });

    pintar();
    return { conFormulario: false, actualizar: pintar };
  };

  // ---------- Limpiar el barro ----------
  // Una foto tapada de barro: se limpia frotando y, ya limpia, aparece la pregunta.
  PP.Desafios.barro = function (zona, d, est, api) {
    var W = 300, H = 400;
    zona.innerHTML =
      '<figure class="barro">' +
        '<img alt="Foto escondida bajo el barro" src="' + esc(d.foto) + '">' +
        '<canvas width="' + W + '" height="' + H + '" aria-hidden="true"></canvas>' +
        '<figcaption>Frotá con el dedo para sacar el barro</figcaption>' +
      '</figure>' +
      '<button type="button" class="boton tinta ancho manguera" hidden>Pasar la manguera 🚿</button>';
    var fig = zona.querySelector('.barro');
    var lienzo = zona.querySelector('canvas');
    var cap = zona.querySelector('figcaption');
    var manguera = zona.querySelector('.manguera');
    var ctx = lienzo.getContext('2d');
    var limpia = !!(est.barroLimpio || est.hecho);

    function limpiar() {
      if (limpia) return;
      limpia = true;
      est.barroLimpio = true;
      api.guardar();
      fig.classList.add('lavada');
      manguera.hidden = true;
      cap.textContent = '¡Limpito!';
      api.mostrarFormulario();
    }

    if (limpia) {
      fig.classList.add('lavada');
      cap.textContent = '¡Limpito!';
      return { conFormulario: true };
    }

    // Barro: base marrón + manchas de distintos tonos
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(0, 0, W, H);
    var tonos = ['#5a3c24', '#7c5837', '#4d331f', '#8a6542', '#634329'];
    for (var i = 0; i < 170; i++) {
      var x = Math.random() * W, y = Math.random() * H, r = 6 + Math.random() * 26;
      ctx.fillStyle = tonos[i % tonos.length];
      ctx.globalAlpha = 0.35 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 38;

    var ultimo = null, trazos = 0;
    function punto(e) {
      var r = lienzo.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    function frotar(e) {
      var p = punto(e);
      ctx.beginPath();
      ctx.moveTo(ultimo ? ultimo.x : p.x, ultimo ? ultimo.y : p.y + 0.1);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ultimo = p;
      if (++trazos % 12 === 0 && PP.fraccionLimpia(ctx.getImageData(0, 0, W, H).data, 7) >= (d.limpieza || 0.6)) limpiar();
    }
    lienzo.addEventListener('pointerdown', function (e) {
      if (limpia) return;
      lienzo.setPointerCapture(e.pointerId);
      ultimo = null;
      frotar(e);
    });
    lienzo.addEventListener('pointermove', function (e) {
      if (!limpia && lienzo.hasPointerCapture(e.pointerId)) frotar(e);
    });
    function soltar() { ultimo = null; }
    lienzo.addEventListener('pointerup', soltar);
    lienzo.addEventListener('pointercancel', soltar);

    // Alternativa sin frotar (teclado, o si el dedo no da más)
    setTimeout(function () { if (!limpia && zona.isConnected) manguera.hidden = false; }, 8000);
    manguera.addEventListener('click', limpiar);

    return { conFormulario: false };
  };

  // ---------- Texto simple ----------
  PP.Desafios.text = function (zona) {
    zona.innerHTML = '<p class="enunciado" style="text-align:center;font-size:40px;margin:4px 0" aria-hidden="true">🫴✉️</p>';
    return { conFormulario: true };
  };
})(globalThis.PP = globalThis.PP || {});
