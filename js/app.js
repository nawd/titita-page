// Arranque y navegación del pasaporte. Rutas por hash: #mapa, #d/<id>, #final
(function (PP) {
  'use strict';

  var cfg = globalThis.CONFIG;
  var prog = PP.Progreso(cfg);
  var esc = PP.esc;
  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };

  var FORMAS = ['circulo', 'rect', 'oval', 'circulo', 'rect', 'oval', 'circulo'];
  var COLORES = ['#1f3a5f', '#7a1f2b', '#2f6b45', '#2f5480', '#5b3a7a', '#8a5a1f', '#9b2c3a'];
  var ROT = [-8, 6, -4, 10, -6, 8, -3];

  PP.sonido.activo = !!prog.estado.sonido;

  // ---------- Fondos de guilloché ----------
  var raiz = document.documentElement.style;
  raiz.setProperty('--guilloche', PP.svgComoUrl(PP.guillocheBanda(600, 60, '#2f5480', 0.22, 16)));
  raiz.setProperty('--guilloche-dorso', PP.svgComoUrl(PP.guillocheRoseta(200, '#e3c88a', 0.5)));

  function selloDe(d, i, chico) {
    var forma = FORMAS[i % FORMAS.length];
    var nombre = d.destino.toUpperCase();
    if (forma === 'rect') {
      return { forma: forma, arriba: 'ENTRADA', centro: d.destino, centroTam: d.destino.length > 10 ? 18 : 26, abajo: d.pais.toUpperCase() + ' · ' + cfg.fecha.slice(-4), color: COLORES[i % COLORES.length], semilla: i * 13 + 5 };
    }
    return { forma: forma, arriba: nombre, abajo: d.pais.toUpperCase(), centro: '0' + (i + 1), sub: chico ? '' : 'SELLADO', color: COLORES[i % COLORES.length], semilla: i * 13 + 5 };
  }

  function contadorHTML() {
    return '<span class="contador" aria-live="polite">Sellos <b>' + prog.sellos() + '/' + cfg.desafios.length + '</b></span>';
  }

  function botonSonido() {
    return '<button class="boton-icono" id="sonido" type="button" aria-pressed="' + PP.sonido.activo + '" aria-label="Sonido">' + (PP.sonido.activo ? '🔊' : '🔇') + '</button>';
  }

  function enlazarSonido(cont) {
    var b = $('#sonido', cont);
    if (!b) return;
    b.addEventListener('click', function () {
      PP.sonido.activo = !PP.sonido.activo;
      prog.estado.sonido = PP.sonido.activo;
      prog.guardar();
      b.textContent = PP.sonido.activo ? '🔊' : '🔇';
      b.setAttribute('aria-pressed', PP.sonido.activo);
      PP.sonarSello();
    });
  }

  // Escribe un texto marcando las letras de la pista oculta
  function textoConPista(el, indice, posiciones) {
    var texto = el.textContent;
    var mias = (posiciones || []).filter(function (p) { return p[0] === indice; }).map(function (p) { return p[1]; });
    if (!mias.length) return;
    var html = '';
    for (var c = 0; c < texto.length; c++) {
      html += mias.indexOf(c) >= 0 ? '<span class="tl">' + esc(texto[c]) + '</span>' : esc(texto[c]);
    }
    el.innerHTML = html;
  }

  function mostrar(id) {
    document.querySelectorAll('#app .pantalla').forEach(function (p) { p.classList.toggle('activa', p.id === id); });
    window.scrollTo(0, 0);
  }

  // ---------- Portada ----------
  function portada() {
    $('#portada-banco').textContent = cfg.agencia;
    $('#portada-escudo').innerHTML = PP.escudoSVG();
    $('#portada-titulo').textContent = cfg.portada.titulo;
    $('#portada-nombre').textContent = 'de ' + cfg.nombre;
    $('#portada-sub').textContent = cfg.portada.subtitulo;
    var boton = $('#abrir');
    boton.textContent = cfg.portada.boton;
    var p = $('#portada');
    p.classList.add('activa');
    boton.addEventListener('click', function () {
      prog.estado.abierto = true;
      prog.guardar();
      ruta();
      p.classList.add('abriendo');
      setTimeout(function () { p.classList.remove('activa', 'abriendo'); }, PP.reducirMovimiento() ? 300 : 1250);
    });
  }

  // ---------- Pasaporte: titular + mapa + sellos ----------
  var mapaPrincipal = null;

  function pasaporte() {
    var sec = $('#pasaporte');
    var t = cfg.titular;
    var nombreMrz = PP.normalizar(cfg.nombre).toUpperCase().replace(/ /g, '<');
    sec.innerHTML =
      '<header class="barra">' +
        '<button class="logo-banco" id="logo" type="button" aria-label="' + esc(cfg.agencia) + '">' + PP.logoSVG() + '</button>' +
        '<span class="marca">' + esc(cfg.agencia) + '<small>Pasaporte de viaje</small></span>' +
        contadorHTML() + botonSonido() +
      '</header>' +
      '<article class="hoja" data-pag="1">' +
        '<h2><span class="chico">Datos del titular</span>' + esc(cfg.nombre) + '</h2>' +
        '<div class="titular-grid">' +
          '<img class="titular-foto" src="' + esc(t.foto) + '" alt="Foto de ' + esc(cfg.nombre) + '">' +
          '<dl class="datos">' +
            '<div><dt>Nacionalidad</dt><dd>' + esc(t.nacionalidad) + '</dd></div>' +
            '<div><dt>Profesión</dt><dd>' + esc(t.profesion) + '</dd></div>' +
            '<div><dt>Expedición</dt><dd>' + esc(cfg.fecha) + '</dd></div>' +
            '<div><dt>Autoridad</dt><dd>' + esc(cfg.agencia) + '</dd></div>' +
          '</dl>' +
        '</div>' +
        '<p class="bienvenida" data-pista="0">' + esc(t.bienvenida) + '</p>' +
        '<p class="mrz" aria-hidden="true">P&lt;NOS' + esc(nombreMrz) + '&lt;&lt;' + new Array(Math.max(4, 30 - nombreMrz.length)).join('&lt;') +
          '<br>' + esc(cfg.numeroCheque) + '&lt;' + cfg.desafios.length + 'SELLOS&lt;&lt;VALIJA&lt;&lt;&lt;&lt;&lt;&lt;&lt;0' + prog.sellos() + '</p>' +
      '</article>' +
      '<article class="hoja" data-pag="2">' +
        '<h2><span class="chico">Destinos</span>Mapa de viajes</h2>' +
        '<p data-pista="1">' + esc(cfg.mapa.intro) + '</p>' +
        '<div class="mapa" id="mapa"></div>' +
        '<ul class="leyenda">' +
          '<li><i style="background:#7a1f2b"></i>' + esc(cfg.mapa.leyenda.visitado) + '</li>' +
          '<li><i style="background:rgba(31,58,95,.62)"></i>' + esc(cfg.mapa.leyenda.otro) + '</li>' +
          '<li><i style="background:linear-gradient(90deg,#8fd0e8,#0f2c4c)"></i>' + esc(cfg.mapa.leyenda.mar) + '</li>' +
        '</ul>' +
      '</article>' +
      '<article class="hoja" data-pag="3">' +
        '<h2><span class="chico">Visas y sellos</span>Sellos del pasaporte</h2>' +
        '<div class="grilla-sellos" id="casillas"></div>' +
        '<button class="boton ancho" id="ir-final" type="button" hidden>Presentar el cheque 🧳</button>' +
      '</article>';

    // Pista oculta
    var posiciones = PP.posicionesPista(PP.textosPista(cfg), cfg.pistaOculta.palabra);
    sec.querySelectorAll('[data-pista]').forEach(function (el) { textoConPista(el, +el.dataset.pista, posiciones); });

    PP.gestosLogo($('#logo', sec), function () {
      if (confirm('¿Reiniciar el pasaporte? Se borran todos los sellos.')) {
        prog.borrar();
        location.hash = '';
        location.reload();
      }
    }, function () {
      document.body.classList.add('lupa');
      setTimeout(function () { document.body.classList.remove('lupa'); }, 3200);
    });
    enlazarSonido(sec);

    // Mapa
    var cont = $('#mapa', sec);
    mapaPrincipal = new PP.Mapa(cont, PP_MAPA.sudamerica, {
      visitados: cfg.mapa.visitados, textoTierra: cfg.mapa.textoTierra, etiqueta: 'Mapa de Sudamérica con los destinos',
    });
    cfg.desafios.forEach(function (d, i) {
      var est = prog.de(d.id);
      var p = PP.proyectar(PP_MAPA.sudamerica, d.lat, d.lon);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pin' + (est.hecho ? ' sellado' : '');
      b.style.left = (p.x * 100) + '%';
      b.style.top = (p.y * 100) + '%';
      b.setAttribute('aria-label', est.hecho ? d.destino + ' (sellado)' : 'Destino ' + (i + 1));
      b.innerHTML = '<span class="punto">' + (est.hecho ? PP.selloSVG(selloDe(d, i, true)) : i + 1) + '</span>';
      b.addEventListener('click', function () { location.hash = '#d/' + d.id; });
      cont.appendChild(b);
    });

    pegarRecuerdos(cont);

    // Casillas de sellos
    var casillas = $('#casillas', sec);
    cfg.desafios.forEach(function (d, i) {
      var est = prog.de(d.id);
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'casilla' + (est.hecho ? ' llena' : '');
      c.setAttribute('aria-label', est.hecho ? 'Sello de ' + d.destino : 'Destino ' + (i + 1) + ' sin sellar');
      if (est.hecho) {
        c.innerHTML = '<span class="sello" style="--rot:' + ROT[i % ROT.length] + 'deg;transform:rotate(var(--rot))">' + PP.selloSVG(selloDe(d, i)) + '</span>';
      } else {
        c.textContent = 'Destino ' + (i + 1) + ' · sin sellar';
      }
      c.addEventListener('click', function () { location.hash = '#d/' + d.id; });
      casillas.appendChild(c);
    });

    var irFinal = $('#ir-final', sec);
    irFinal.hidden = prog.sellos() < cfg.desafios.length;
    // Con un sello de margen, Three.js se va bajando en segundo plano para que el final no espere
    if (prog.sellos() >= cfg.desafios.length - 1) PP.precargarThree();
    irFinal.addEventListener('click', function () { location.hash = '#final'; });
    mostrar('pasaporte');
  }

  // ---------- Recuerdos: polaroids en el mapa ----------
  // Aparecen cuando están resueltos los desafíos de los que dependen (si no, darían las respuestas)
  function pegarRecuerdos(cont) {
    var vistos = prog.estado.recuerdosVistos || [];
    var hilos = '', nuevos = 0;
    (cfg.mapa.recuerdos || []).forEach(function (r) {
      var listo = (r.tras || cfg.mapa.recuerdosTras || []).every(function (idD) { return prog.de(idD).hecho; });
      if (!listo) return;
      var p = PP.proyectar(PP_MAPA.sudamerica, r.lat, r.lon);
      var x = p.x * 100 + (r.dx || 0), y = p.y * 100 + (r.dy || 0);
      hilos += '<line x1="' + (p.x * 100).toFixed(2) + '" y1="' + (p.y * 100).toFixed(2) + '" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '"/>';
      var nuevo = vistos.indexOf(r.foto) < 0;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'polaroid' + (nuevo ? ' nueva' : '');
      b.style.left = x + '%';
      b.style.top = y + '%';
      b.style.setProperty('--rot', (r.rot || 0) + 'deg');
      if (nuevo) b.style.animationDelay = (0.5 + nuevos++ * 0.3) + 's';
      b.setAttribute('aria-label', 'Recuerdo: ' + r.lugar + ', ' + r.fecha);
      b.innerHTML = '<img alt="" src="' + esc(r.foto) + '"><span>' + esc(r.lugar) + '<br>' + esc(r.fecha) + '</span>';
      b.addEventListener('click', function () { verRecuerdo(r); });
      cont.appendChild(b);
      if (nuevo) vistos.push(r.foto);
    });
    if (!hilos) return;
    cont.insertAdjacentHTML('afterbegin', '<svg class="hilos" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + hilos + '</svg>');
    prog.estado.recuerdosVistos = vistos;
    prog.guardar();
  }

  function verRecuerdo(r) {
    var capa = document.createElement('div');
    capa.className = 'capa';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-label', r.lugar + ', ' + r.fecha);
    capa.innerHTML =
      '<figure class="polaroid-grande" style="--rot:' + ((r.rot || 0) / 3).toFixed(1) + 'deg">' +
        '<img alt="' + esc(r.lugar) + '" src="' + esc(r.grande || r.foto) + '">' +
        '<figcaption><b>' + esc(r.lugar) + ' · ' + esc(r.fecha) + '</b>' + (r.nota ? esc(r.nota) : '') + '</figcaption>' +
        '<button type="button" class="boton tinta ancho">Cerrar</button>' +
      '</figure>';
    function cerrar() { capa.remove(); document.removeEventListener('keydown', tecla); }
    function tecla(e) { if (e.key === 'Escape') cerrar(); }
    capa.addEventListener('click', cerrar);
    document.addEventListener('keydown', tecla);
    document.body.appendChild(capa);
    capa.querySelector('button').focus();
  }

  // ---------- Desafío ----------
  function desafio(id) {
    var i = cfg.desafios.findIndex(function (d) { return d.id === id; });
    if (i < 0) { location.hash = '#mapa'; return; }
    var d = cfg.desafios[i];
    var est = prog.de(d.id);
    var sec = $('#desafio');
    sec.innerHTML =
      '<header class="barra">' +
        '<button class="volver" type="button" id="volver">← Mapa</button>' +
        contadorHTML() + botonSonido() +
      '</header>' +
      '<article class="hoja visa" data-pag="' + (i + 4) + '">' +
        '<p class="visa-num" id="visa-num"></p>' +
        '<h2 id="titulo-destino"></h2>' +
        '<p class="enunciado">' + esc(d.enunciado) + '</p>' +
        '<div class="zona" id="zona"></div>' +
        '<form class="respuesta" id="form" autocomplete="off" hidden>' +
          '<label class="sr" for="intento">Tu respuesta</label>' +
          '<input id="intento" name="intento" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Tu respuesta">' +
          '<button class="boton" type="submit">Sellar</button>' +
        '</form>' +
        '<p class="feedback" id="feedback" aria-live="polite"></p>' +
        '<div class="sello-lugar" id="sello-lugar"></div>' +
        '<div class="recompensa" id="recompensa" hidden></div>' +
        '<div class="pistas" id="pistas"></div>' +
        '<button class="boton tinta ancho" type="button" id="siguiente" hidden></button>' +
      '</article>';
    enlazarSonido(sec);
    $('#volver', sec).addEventListener('click', function () { location.hash = '#mapa'; });

    var form = $('#form', sec);
    var input = $('#intento', sec);
    var feedback = $('#feedback', sec);
    var pistasEl = $('#pistas', sec);
    var vistas = PP.pistasVisibles(PP.pistasDe(d, est).errores);

    function titulos() {
      $('#visa-num', sec).textContent = 'Visa N° 0' + (i + 1) + (est.hecho ? ' · ' + d.pais : ' · destino secreto');
      $('#titulo-destino', sec).textContent = est.hecho ? d.destino : 'Destino ' + (i + 1);
    }

    function pintarPistas(animar) {
      var p = PP.pistasDe(d, est);
      var n = PP.pistasVisibles(p.errores);
      pistasEl.innerHTML = p.lista.map(function (texto, k) {
        if (k < n) return '<div class="pista' + (animar && k >= vistas ? ' nueva' : '') + '">' + esc(texto) + '</div>';
        return '<div class="pista bloqueada">Pista ' + (k + 1) + ' · se desbloquea con ' + (k === 0 ? 2 : 4) + ' errores</div>';
      }).join('');
      vistas = n;
      pistasEl.hidden = est.hecho;
    }

    function siguiente() {
      var b = $('#siguiente', sec);
      var todos = prog.sellos() === cfg.desafios.length;
      b.hidden = false;
      b.className = todos ? 'boton ancho' : 'boton tinta ancho';
      b.textContent = todos ? 'Presentar el cheque 🧳' : 'Volver al mapa';
      b.onclick = function () { location.hash = todos ? '#final' : '#mapa'; };
    }

    function recompensa() {
      var r = d.recompensa || {};
      var el = $('#recompensa', sec);
      el.innerHTML = (r.imagen ? '<img src="' + esc(r.imagen) + '" alt="">' : '') + (r.texto ? '<p>' + esc(r.texto) + '</p>' : '');
      el.hidden = !r.imagen && !r.texto;
    }

    var api = {
      guardar: function () { prog.guardar(); },
      mostrarFormulario: function () {
        if (est.hecho) return;
        form.hidden = false;
      },
      errorSilencioso: function () {
        est.errores++;
        prog.guardar();
        pintarPistas(true);
      },
      intentar: async function (valor, elTemblar) {
        if (est.hecho) return true;
        if (PP.verificar(d, valor, est)) {
          // Con rondas, un acierto puede pasar a la siguiente foto en vez de sellar
          var otraRonda = zonaApi.acierto && zonaApi.acierto();
          if (otraRonda) {
            feedback.className = 'feedback ok';
            feedback.textContent = otraRonda;
            input.value = '';
            pintarPistas(false);
            return true;
          }
          await sellar();
          return true;
        }
        est.errores++;
        prog.guardar();
        feedback.className = 'feedback';
        feedback.textContent = PP.mensajeError(cfg.mensajesError, est.errores - 1 + i * 2);
        PP.temblar(elTemblar || input);
        pintarPistas(true);
        if (zonaApi.actualizar) zonaApi.actualizar();
        if (PP.tocaFalsaDerrota(est, cfg.limiteErrores, !d.sinFalsaDerrota)) {
          est.falsaVista = true;
          prog.guardar();
          await PP.falsaDerrota(cfg.falsaDerrota);
        }
        return false;
      },
    };

    async function sellar() {
      est.hecho = true;
      prog.guardar();
      form.hidden = true;
      input.blur();
      feedback.className = 'feedback ok';
      feedback.textContent = '¡Sellado!';
      titulos();
      pintarPistas(false);
      $('.contador', sec).innerHTML = 'Sellos <b>' + prog.sellos() + '/' + cfg.desafios.length + '</b>';
      if (zonaApi.actualizar) zonaApi.actualizar();
      var lugar = $('#sello-lugar', sec);
      lugar.scrollIntoView({ block: 'center', behavior: PP.reducirMovimiento() ? 'auto' : 'smooth' });
      await PP.estampar(lugar, selloDe(d, i), ROT[i % ROT.length]);
      var todos = prog.sellos() === cfg.desafios.length;
      if (prog.sellos() >= cfg.desafios.length - 1) PP.precargarThree();
      PP.confeti({ cantidad: todos ? 160 : 80, y: 0.45 });
      recompensa();
      siguiente();
    }

    var zonaApi = PP.Desafios[d.tipo]($('#zona', sec), d, est, api);
    form.hidden = !zonaApi.conFormulario || est.hecho;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      if (!v.trim()) { PP.temblar(input); return; }
      api.intentar(v, input).then(function (ok) { if (!ok) input.select(); });
    });

    titulos();
    pintarPistas(false);
    if (est.hecho) {
      var lugar = $('#sello-lugar', sec);
      lugar.innerHTML = '<div class="sello" style="--rot:' + ROT[i % ROT.length] + 'deg">' + PP.selloSVG(selloDe(d, i)) + '</div>';
      recompensa();
      siguiente();
    }
    mostrar('desafio');
  }

  // ---------- Final ----------
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, PP.reducirMovimiento() ? 0 : ms); }); }

  function final() {
    if (prog.sellos() < cfg.desafios.length) { location.hash = '#mapa'; return; }
    var f = cfg.final;
    var sec = $('#final');
    sec.innerHTML =
      '<header class="barra">' +
        '<button class="volver" type="button" id="volver">← Pasaporte</button>' +
        contadorHTML() + botonSonido() +
      '</header>' +
      '<article class="hoja final-hoja" data-pag="✓">' +
        '<h2><span class="chico">' + esc(cfg.agencia) + '</span>Cobro del cheque</h2>' +
        '<div class="escena-valija" id="escena-valija"></div>' +
        '<div class="cheque-pantalla" id="cheque" hidden>' + PP.chequeHTML(cfg, { monto: '????' }) + '</div>' +
        '<p class="verificando" id="verificando" aria-live="polite"></p>' +
        '<div id="revelado" hidden>' +
          '<p class="titulo-final revela">' + esc(f.titulo) + '</p>' +
          '<p class="mensaje-final revela" id="mensaje"></p>' +
          '<p class="guino revela">' + esc(f.guinoEtiqueta) + '</p>' +
          '<button class="boton ancho" type="button" id="ver-proximo">' + esc(f.boton) + '</button>' +
        '</div>' +
      '</article>' +
      '<article class="hoja final-hoja" id="proximo" hidden>' +
        '<h2><span class="chico">Próximo destino</span>' + esc(f.proximo.titulo) + '</h2>' +
        '<p>' + esc(f.proximo.texto) + '</p>' +
        '<div class="mapa-final" id="mapa-final"><div class="capa-sa"></div><div class="capa-pat"></div></div>' +
        '<div id="galeria"></div>' +
        '<p class="cierre">' + esc(f.proximo.cierre) + '</p>' +
        (f.proximo.algunDia ? '<p class="guino">' + esc(f.proximo.algunDia) + '</p>' : '') +
        (f.proximo.eleccion ? '<div class="eleccion" id="eleccion"></div>' : '') +
      '</article>';
    enlazarSonido(sec);
    $('#volver', sec).addEventListener('click', function () { location.hash = '#mapa'; });
    mostrar('final');
    // La valija 3D se arma mientras la agencia "verifica" los sellos
    var foto = (f.proximo.galeria || [])[0];
    var valija = PP.Valija3D($('#escena-valija', sec), cfg, {
      sellos: cfg.desafios.map(function (d, i) { return PP.selloSVG(selloDe(d, i)); }),
      foto: foto && foto.src,
      pieFoto: f.proximo.titulo,
      alAterrizar: PP.sonarSello,
      alAbrir: function () { PP.confeti({ cantidad: 60, y: 0.3, fuerza: 0.8 }); },
    }).catch(function () { return null; });
    cobrar(sec, valija);
  }

  // Resuelve null si la valija tarda demasiado (conexión lenta): el final sigue en 2D
  function conLimite(promesa, ms) {
    return Promise.race([promesa, new Promise(function (r) { setTimeout(function () { r(null); }, ms); })]);
  }

  async function cobrar(sec, promValija) {
    var f = cfg.final;
    var ver = $('#verificando', sec);
    ver.textContent = f.verificando;
    await esperar(1100);
    for (var k = 0; k < cfg.desafios.length; k++) {
      ver.textContent = '✔ Sello ' + (k + 1) + ' de ' + cfg.desafios.length + ' · ' + cfg.desafios[k].destino;
      await esperar(480);
    }
    var datos = { monto: f.monto, moneda: f.moneda, mensaje: f.mensaje };
    ver.textContent = '';
    var escena = $('#escena-valija', sec);
    var valija = await conLimite(promValija, 9000);
    if (valija) {
      ver.textContent = 'Abriendo tu valija…';
      await valija.abrir();
      ver.textContent = '';
    } else {
      escena.hidden = true;
    }
    var chequeEl = $('#cheque', sec);
    chequeEl.hidden = false;
    chequeEl.classList.add('revela');
    await esperar(500);
    await PP.estampar($('.ch-sello', sec), {
      forma: 'rect', arriba: cfg.agencia.toUpperCase(), centro: f.sello, centroTam: 30,
      abajo: new Date().toLocaleDateString('es-AR'), color: '#9b2c3a', semilla: 21,
    }, -9);
    PP.confeti({ cantidad: 140, x: 0.5, y: 0.35, fuerza: 1.1 });
    setTimeout(function () { PP.confeti({ cantidad: 90, x: 0.15, y: 0.6 }); }, 450);
    setTimeout(function () { PP.confeti({ cantidad: 90, x: 0.85, y: 0.6 }); }, 800);
    await contarMonto($('.ch-valor', sec), datos.monto);
    prog.estado.finalVisto = true;
    prog.guardar();
    var rev = $('#revelado', sec);
    $('#mensaje', sec).textContent = datos.mensaje;
    rev.hidden = false;
    $('#ver-proximo', sec).addEventListener('click', function () { proximo(sec); }, { once: true });
  }

  function contarMonto(el, monto) {
    var n = Number(monto);
    if (!isFinite(n) || PP.reducirMovimiento()) { el.textContent = isFinite(n) ? n.toLocaleString('es-AR') : String(monto); return Promise.resolve(); }
    return new Promise(function (listo) {
      var t0 = performance.now(), dur = 1800;
      function paso(ahora) {
        var p = Math.min(1, (ahora - t0) / dur);
        var suave = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(n * suave).toLocaleString('es-AR');
        if (p < 1) requestAnimationFrame(paso); else listo();
      }
      requestAnimationFrame(paso);
    });
  }

  function proximo(sec) {
    var art = $('#proximo', sec);
    art.hidden = false;
    art.scrollIntoView({ behavior: PP.reducirMovimiento() ? 'auto' : 'smooth', block: 'start' });
    var p = cfg.final.proximo;
    var marco = $('#mapa-final', sec);
    var capaSa = $('.capa-sa', marco);
    var capaPat = $('.capa-pat', marco);
    var sa = PP_MAPA.sudamerica, pat = PP_MAPA.patagonia;
    new PP.Mapa(capaPat, pat, { visitados: cfg.mapa.visitados, textoTierra: cfg.mapa.textoTierra, etiqueta: 'Mapa de los lagos del sur' });
    new PP.Mapa(capaSa, sa, { visitados: cfg.mapa.visitados, textoTierra: cfg.mapa.textoTierra, animar: false, etiqueta: '' });

    // Ruta y paradas sobre el mapa de la Patagonia
    var alto = (100 * pat.rows) / pat.cols;
    var pts = p.ruta.map(function (r) { var q = PP.proyectar(pat, r.lat, r.lon); return { x: q.x * 100, y: q.y * alto, q: q, r: r }; });
    var dRuta = pts.map(function (pt, k) {
      if (!k) return 'M' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2);
      var a = pts[k - 1];
      var cx = (a.x + pt.x) / 2 + (pt.y - a.y) * 0.25, cy = (a.y + pt.y) / 2 - (pt.x - a.x) * 0.25;
      return 'Q' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2);
    }).join(' ');
    var svg = '<svg class="ruta" viewBox="0 0 100 ' + alto.toFixed(2) + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><mask id="revelar-ruta"><path d="' + dRuta + '" stroke="#fff" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" id="mascara-ruta"/></mask></defs>' +
      '<path class="trazo" d="' + dRuta + '" mask="url(#revelar-ruta)"/>' +
      '<path d="' + dRuta + '" mask="url(#revelar-ruta)"/></svg>';
    capaPat.insertAdjacentHTML('beforeend', svg);

    function mostrarRuta() {
      var m = $('#mascara-ruta', capaPat);
      var reducir = PP.reducirMovimiento();
      if (reducir) m.setAttribute('stroke-dashoffset', '0');
      else m.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 2600, easing: 'ease-in-out', fill: 'forwards' });
      pts.forEach(function (pt, k) {
        var el = document.createElement('div');
        el.className = 'parada' + (pt.q.x >= 0.5 ? ' izq' : '');
        el.style.left = (pt.q.x * 100) + '%';
        el.style.top = (pt.q.y * 100) + '%';
        el.style.animationDelay = reducir ? '0s' : (0.3 + k * 0.6) + 's';
        el.innerHTML = '<span>' + esc(pt.r.nombre) + '</span>';
        capaPat.appendChild(el);
      });
    }

    // Zoom: Sudamérica entera → recuadro de la Patagonia
    var W = marco.clientWidth;
    var hSa = (W / sa.cols) * sa.rows;
    var hPat = (W / pat.cols) * pat.rows;
    var a = PP.proyectar(sa, pat.latMax, pat.lonMin), b = PP.proyectar(sa, pat.latMin, pat.lonMax);
    var s1 = W / ((b.x - a.x) * W);
    var s0 = hPat / hSa;
    capaSa.style.transform = 'translate(' + ((W - W * s0) / 2) + 'px,0) scale(' + s0 + ')';
    if (PP.reducirMovimiento()) {
      marco.classList.add('zoom');
      mostrarRuta();
    } else {
      setTimeout(function () {
        capaSa.animate([
          { transform: capaSa.style.transform },
          { transform: 'translate(' + (-a.x * W * s1) + 'px,' + (-a.y * hSa * s1) + 'px) scale(' + s1 + ')' },
        ], { duration: 2400, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
        setTimeout(function () { marco.classList.add('zoom'); }, 1900);
        setTimeout(mostrarRuta, 2600);
      }, 700);
    }

    PP.Galeria($('#galeria', sec), p.galeria, 4200);
    if (p.eleccion) eleccion($('#eleccion', sec), p.eleccion);
  }

  // El viaje siguiente: dos opciones, ella elige y la agencia le pone el sello
  function eleccion(cont, e) {
    cont.innerHTML =
      '<h3>' + esc(e.titulo) + '</h3>' +
      (e.texto ? '<p>' + esc(e.texto) + '</p>' : '') +
      '<div class="opciones-viaje">' + e.opciones.map(function (o, i) {
        return '<button type="button" class="opcion-viaje" data-i="' + i + '" aria-pressed="false">' +
          '<span class="emoji" aria-hidden="true">' + esc(o.emoji || '✈️') + '</span>' +
          '<b>' + esc(o.lugar) + '</b><small>' + esc(o.pais) + (o.voto ? ' · voto de ' + esc(o.voto) : '') + '</small>' +
          '<span class="sello-eleccion" aria-hidden="true"></span>' +
        '</button>';
      }).join('') + '</div>' +
      '<p class="feedback ok" aria-live="polite"></p>';
    var msj = $('.feedback', cont);
    function marcar(i, animar) {
      cont.querySelectorAll('.opcion-viaje').forEach(function (b, k) {
        var elegida = k === i;
        b.classList.toggle('elegida', elegida);
        b.setAttribute('aria-pressed', elegida);
        var lugar = $('.sello-eleccion', b);
        lugar.innerHTML = '';
        if (elegida && !animar) lugar.innerHTML = '<div class="sello" style="--rot:-12deg">' + PP.selloSVG(selloEleccion()) + '</div>';
        if (elegida && animar) PP.estampar(lugar, selloEleccion(), -12);
      });
      msj.textContent = e.opciones[i].mensaje || '';
    }
    function selloEleccion() {
      return { forma: 'rect', arriba: cfg.agencia.toUpperCase(), centro: 'ELEGIDO', centroTam: 24, abajo: e.titulo.replace(/[^\d]/g, '') || '', color: '#9b2c3a', semilla: 33 };
    }
    cont.addEventListener('click', function (ev) {
      var b = ev.target.closest('.opcion-viaje');
      if (!b || +b.dataset.i === prog.estado.eleccion) return;
      prog.estado.eleccion = +b.dataset.i;
      prog.guardar();
      marcar(prog.estado.eleccion, true);
      PP.confeti({ cantidad: 50, y: 0.7, fuerza: 0.7 });
    });
    if (typeof prog.estado.eleccion === 'number' && e.opciones[prog.estado.eleccion]) marcar(prog.estado.eleccion, false);
  }

  // ---------- Rutas ----------
  function ruta() {
    var h = location.hash;
    if (!prog.estado.abierto) return;
    if (h.indexOf('#d/') === 0) desafio(decodeURIComponent(h.slice(3)));
    else if (h === '#final') final();
    else pasaporte();
  }

  window.addEventListener('hashchange', ruta);
  if (prog.estado.abierto) ruta(); else portada();
})(globalThis.PP = globalThis.PP || {});
