// Efectos: sello que cae, temblor, sonido sintetizado, confeti en canvas y falsa derrota.
(function (PP) {
  'use strict';

  // ---------- Sonido (WebAudio, sin archivos) ----------
  var audio = null;
  PP.sonido = { activo: false };
  function ctxAudio() {
    if (!audio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = new AC();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  PP.sonarSello = function () {
    if (!PP.sonido.activo) return;
    var ac = ctxAudio();
    if (!ac) return;
    var t = ac.currentTime;
    // golpe grave
    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g).connect(ac.destination);
    osc.start(t); osc.stop(t + 0.26);
    // chasquido de papel
    var buf = ac.createBuffer(1, ac.sampleRate * 0.08, ac.sampleRate);
    var datos = buf.getChannelData(0);
    for (var i = 0; i < datos.length; i++) datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / datos.length, 3);
    var ruido = ac.createBufferSource();
    var filtro = ac.createBiquadFilter();
    var g2 = ac.createGain();
    ruido.buffer = buf;
    filtro.type = 'lowpass'; filtro.frequency.value = 1800;
    g2.gain.value = 0.5;
    ruido.connect(filtro).connect(g2).connect(ac.destination);
    ruido.start(t);
  };

  // ---------- Sello ----------
  // Inserta un sello en `destino` con animación de caída. Devuelve una promesa.
  PP.estampar = function (destino, opcionesSello, rot) {
    var el = document.createElement('div');
    el.className = 'sello cae';
    el.style.setProperty('--rot', (rot == null ? -8 : rot) + 'deg');
    el.innerHTML = PP.selloSVG(opcionesSello);
    destino.appendChild(el);
    return new Promise(function (listo) {
      if (PP.reducirMovimiento()) { PP.sonarSello(); listo(el); return; }
      setTimeout(PP.sonarSello, 380); // cuando toca el papel
      el.addEventListener('animationend', function () { listo(el); }, { once: true });
      setTimeout(function () { listo(el); }, 1200);
    });
  };

  PP.temblar = function (el) {
    el.classList.remove('tiembla');
    void el.offsetWidth;
    el.classList.add('tiembla');
    if (navigator.vibrate) { try { navigator.vibrate([30, 40, 30]); } catch (e) { /* nada */ } }
  };

  // ---------- Confeti ----------
  var COLORES = ['#7a1f2b', '#1f3a5f', '#c9a45c', '#8fd0e8', '#f3ead3', '#2f6b45', '#9b2c3a'];
  var particulas = [];
  var corriendo = false;

  // opciones: { cantidad, x, y (0..1 relativo a la ventana), fuerza }
  PP.confeti = function (op) {
    op = op || {};
    if (PP.reducirMovimiento()) return;
    var canvas = document.getElementById('confeti');
    if (!canvas) return;
    var w = window.innerWidth, h = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    var cantidad = op.cantidad || 120;
    var ox = (op.x == null ? 0.5 : op.x) * w;
    var oy = (op.y == null ? 0.35 : op.y) * h;
    var fuerza = op.fuerza || 1;
    for (var i = 0; i < cantidad; i++) {
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      var vel = (6 + Math.random() * 9) * fuerza;
      particulas.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel,
        w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        osc: Math.random() * Math.PI * 2,
        color: COLORES[(Math.random() * COLORES.length) | 0],
        forma: Math.random() < 0.15 ? 'corazon' : Math.random() < 0.3 ? 'circulo' : 'papel',
        vida: 0,
      });
    }
    if (corriendo) return;
    corriendo = true;
    var ctx = canvas.getContext('2d');
    function paso() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      particulas = particulas.filter(function (p) { return p.y < h + 40 && p.vida < 600; });
      particulas.forEach(function (p) {
        p.vida++;
        p.vy += 0.25;
        p.vx *= 0.985; p.vy *= 0.985;
        p.osc += 0.12;
        p.x += p.vx + Math.sin(p.osc) * 0.8;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.forma === 'circulo') {
          ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
        } else if (p.forma === 'corazon') {
          var s = p.w / 6;
          ctx.beginPath();
          ctx.moveTo(0, s * 2);
          ctx.bezierCurveTo(-s * 4, -s, -s * 2, -s * 4, 0, -s * 1.5);
          ctx.bezierCurveTo(s * 2, -s * 4, s * 4, -s, 0, s * 2);
          ctx.fill();
        } else {
          // papelito que gira: se achata con el coseno para simular el giro 3D
          ctx.scale(1, Math.cos(p.osc));
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });
      if (particulas.length) requestAnimationFrame(paso);
      else { corriendo = false; ctx.clearRect(0, 0, w, h); }
    }
    requestAnimationFrame(paso);
  };

  // ---------- Falsa derrota ----------
  PP.falsaDerrota = function (fd) {
    return new Promise(function (listo) {
      var capa = document.createElement('div');
      capa.className = 'capa';
      capa.setAttribute('role', 'alertdialog');
      capa.setAttribute('aria-live', 'assertive');
      capa.innerHTML =
        '<div class="rechazo">' +
        '<div class="sello-rechazo">' + PP.esc(fd.titulo) + '</div>' +
        '<p>' + PP.esc(fd.subtitulo) + '</p>' +
        '</div>';
      document.body.appendChild(capa);
      setTimeout(function () {
        var caja = capa.querySelector('.rechazo');
        caja.innerHTML =
          '<div class="giro">' + PP.esc(fd.giro) + '</div>' +
          '<button class="boton tinta" type="button">' + PP.esc(fd.boton) + '</button>';
        var b = caja.querySelector('button');
        b.focus();
        b.addEventListener('click', function () { capa.remove(); listo(); });
      }, (fd.segundos || 4) * 1000);
    });
  };
})(globalThis.PP = globalThis.PP || {});
