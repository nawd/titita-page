// Postal de la portada (Three.js desde CDN, el mismo que la valija).
// Cae sobre la mesa; se da vuelta con un toque o arrastrando: frente "Saludos desde…",
// dorso con estampilla, matasellos y el mensaje. Al empezar el viaje sale volando.
// Si no hay WebGL o no carga Three.js, PP.postalCSS hace lo mismo con las mismas caras en 2D.
(function (PP) {
  'use strict';

  var ANCHO = 1200, ALTO = 800;          // caras en px (postal de 3:2)
  var W = 1.5, H = 1.0, GROSOR = 0.012;  // postal en metros "de juguete"

  // ---------- Caras dibujadas en canvas ----------
  function cubrir(ctx, img, x, y, w, h) {
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var k = Math.max(w / iw, h / ih);
    ctx.drawImage(img, (iw - w / k) / 2, (ih - h / k) / 2, w / k, h / k, x, y, w, h);
  }

  function degradeSinFoto(ctx, x, y, w, h) {
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#8fd0e8'); g.addColorStop(0.55, '#2f5480'); g.addColorStop(1, '#7a1f2b');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function rectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function grano(ctx, w, h, fuerza) {
    var datos = ctx.getImageData(0, 0, w, h), d = datos.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * fuerza;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(datos, 0, 0);
  }

  function tenir(c, color) {
    var t = PP.lienzo(c.width, c.height), ctx = t.getContext('2d');
    ctx.drawImage(c, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    return t;
  }

  // Máscara del título en letras gordas (el trazo engorda la tipografía)
  function mascaraTitulo(lineas, tam, centros, extra) {
    var m = PP.lienzo(ANCHO, ALTO), ctx = m.getContext('2d');
    ctx.font = tam + 'px "IM Fell English", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 12 + extra;
    ctx.fillStyle = ctx.strokeStyle = '#000';
    lineas.forEach(function (l, i) {
      ctx.strokeText(l, ANCHO / 2, centros[i]);
      ctx.fillText(l, ANCHO / 2, centros[i]);
    });
    return m;
  }

  function texFrente(cfg, fondo, letras) {
    var p = cfg.portada;
    var c = PP.lienzo(ANCHO, ALTO), ctx = c.getContext('2d');
    var borde = 34;
    ctx.fillStyle = '#f6efdc';
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // Foto de fondo con viñeta
    ctx.save();
    rectRedondeado(ctx, borde, borde, ANCHO - borde * 2, ALTO - borde * 2, 14);
    ctx.clip();
    if (fondo) cubrir(ctx, fondo, borde, borde, ANCHO - borde * 2, ALTO - borde * 2);
    else degradeSinFoto(ctx, borde, borde, ANCHO - borde * 2, ALTO - borde * 2);
    var v = ctx.createRadialGradient(ANCHO / 2, ALTO / 2, ALTO * 0.3, ANCHO / 2, ALTO / 2, ANCHO * 0.7);
    v.addColorStop(0, 'rgba(20, 12, 8, 0.15)'); v.addColorStop(1, 'rgba(20, 12, 8, 0.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.restore();

    // Título: dos líneas si son dos palabras, al tamaño que entre
    var lineas = p.titulo.toUpperCase().split(/\s+/);
    if (lineas.length > 2) lineas = [lineas.slice(0, Math.ceil(lineas.length / 2)).join(' '), lineas.slice(Math.ceil(lineas.length / 2)).join(' ')];
    ctx.font = '100px "IM Fell English", Georgia, serif';
    var masAncha = Math.max.apply(null, lineas.map(function (l) { return ctx.measureText(l).width; }));
    var tam = Math.min(lineas.length > 1 ? 230 : 300, Math.floor(100 * 960 / masAncha));
    var centros = lineas.length > 1 ? [ALTO / 2 + tam * 0.12, ALTO / 2 + tam * 1.12] : [ALTO / 2 + tam * 0.55]; // aire para la tilde de la Ó

    var contorno = mascaraTitulo(lineas, tam, centros, 22);
    var profundidad = tenir(contorno, '#3f0d14');
    for (var k = 14; k >= 1; k--) ctx.drawImage(profundidad, k * 0.9, k * 1.1);
    ctx.drawImage(tenir(contorno, '#f6efdc'), 0, 0);

    var relleno = mascaraTitulo(lineas, tam, centros, 0);
    var rctx = relleno.getContext('2d');
    rctx.globalCompositeOperation = 'source-in';
    rctx.filter = 'saturate(1.5) contrast(1.1)';
    if (letras) cubrir(rctx, letras, 0, centros[0] - tam, ANCHO, centros[centros.length - 1] - centros[0] + tam * 1.2);
    else degradeSinFoto(rctx, 0, 0, ANCHO, ALTO);
    var brillo = rctx.createLinearGradient(0, centros[0] - tam, 0, centros[centros.length - 1]);
    brillo.addColorStop(0, 'rgba(255, 255, 255, 0.25)'); brillo.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    rctx.filter = 'none';
    rctx.globalCompositeOperation = 'source-atop';
    rctx.fillStyle = brillo;
    rctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.drawImage(relleno, 0, 0);

    // "Saludos desde" en cursiva, arriba del título
    ctx.save();
    ctx.translate(ANCHO / 2 - 40, centros[0] - tam * 0.95);
    ctx.rotate(-0.05);
    ctx.font = 'italic 88px "IM Fell English", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3f0d14';
    ctx.strokeText(p.saludo, 0, 0);
    ctx.fillStyle = '#f6efdc';
    ctx.fillText(p.saludo, 0, 0);
    ctx.restore();

    // Pie chiquito
    ctx.font = '22px "Special Elite", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(246, 239, 220, 0.9)';
    ctx.fillText((cfg.agencia + ' · Edición ' + cfg.nombre + ' · ' + cfg.fecha).toUpperCase(), ANCHO / 2, ALTO - borde - 22);

    grano(ctx, ANCHO, ALTO, 16);
    return c;
  }

  // Corta el texto en renglones que entren en `ancho`
  function renglones(ctx, texto, ancho) {
    var palabras = texto.split(/\s+/), lineas = [], linea = '';
    palabras.forEach(function (p) {
      var prueba = linea ? linea + ' ' + p : p;
      if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = p; } else linea = prueba;
    });
    if (linea) lineas.push(linea);
    return lineas;
  }

  // Estampilla con bordes dentados y el escudo de la agencia
  function estampilla(escudo, cfg) {
    var w = 220, h = 264, r = 9, paso = 22;
    var c = PP.lienzo(w, h), ctx = c.getContext('2d');
    ctx.fillStyle = '#fbf8ef';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out';
    for (var x = paso / 2; x < w; x += paso) { ctx.beginPath(); ctx.arc(x, 0, r, 0, Math.PI * 2); ctx.arc(x, h, r, 0, Math.PI * 2); ctx.fill(); }
    for (var y = paso / 2; y < h; y += paso) { ctx.beginPath(); ctx.arc(0, y, r, 0, Math.PI * 2); ctx.arc(w, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#7a1f2b';
    ctx.fillRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = '#e3c88a';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, w - 56, h - 56);
    if (escudo) ctx.drawImage(escudo, w / 2 - 70, 52, 140, 140);
    ctx.fillStyle = '#e3c88a';
    ctx.textAlign = 'center';
    ctx.font = '15px "Special Elite", monospace';
    ctx.fillText('CORREO ' + cfg.autor.toUpperCase(), w / 2, 50);
    ctx.font = 'italic 26px "IM Fell English", Georgia, serif';
    ctx.fillText('1 beso', w / 2, h - 40);
    return c;
  }

  function texDorso(cfg, escudo, matasellos) {
    var p = cfg.portada;
    var c = PP.lienzo(ANCHO, ALTO), ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, ANCHO, ALTO);
    g.addColorStop(0, '#f6efdc'); g.addColorStop(1, '#ebdcb8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.strokeStyle = 'rgba(31, 58, 95, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, ANCHO - 48, ALTO - 48);

    ctx.fillStyle = '#1f3a5f';
    ctx.textAlign = 'left';
    ctx.font = '26px "Special Elite", monospace';
    ctx.fillText('TARJETA POSTAL · ' + cfg.agencia.toUpperCase(), 60, 86);

    // Línea divisoria
    ctx.strokeStyle = 'rgba(31, 58, 95, 0.5)';
    ctx.beginPath(); ctx.moveTo(640, 140); ctx.lineTo(640, ALTO - 70); ctx.stroke();

    // Mensaje a mano (achica la letra hasta que entre)
    var tam = 50, lineas;
    do {
      ctx.font = 'italic ' + tam + 'px "IM Fell English", Georgia, serif';
      lineas = renglones(ctx, p.mensaje, 530);
      tam -= 2;
    } while (lineas.length * tam * 1.3 > 560 && tam > 26);
    ctx.fillStyle = '#1f3a5f';
    lineas.forEach(function (l, i) { ctx.fillText(l, 64, 200 + i * tam * 1.3); });

    // Estampilla + matasellos con onditas encima
    ctx.save();
    ctx.translate(1010, 210);
    ctx.rotate(0.04);
    ctx.drawImage(estampilla(escudo, cfg), -110, -132);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.translate(850, 200);
    ctx.rotate(-0.22);
    if (matasellos) ctx.drawImage(matasellos, -115, -115, 230, 230);
    ctx.restore();
    ctx.strokeStyle = 'rgba(31, 58, 95, 0.7)';
    ctx.lineWidth = 3;
    for (var o = 0; o < 5; o++) {
      ctx.beginPath();
      for (var x = 940; x <= 1150; x += 4) {
        var y = 150 + o * 22 + Math.sin(x / 18) * 6;
        if (x === 940) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Destinatario sobre renglones
    ctx.strokeStyle = 'rgba(31, 58, 95, 0.55)';
    ctx.lineWidth = 2;
    [500, 590, 680].forEach(function (y) { ctx.beginPath(); ctx.moveTo(690, y); ctx.lineTo(1140, y); ctx.stroke(); });
    ctx.fillStyle = '#7a1f2b';
    ctx.font = '28px "Special Elite", monospace';
    ctx.fillText('PARA:', 690, 488);
    ctx.font = 'italic 70px "IM Fell English", Georgia, serif';
    ctx.fillText(p.para, 800, 488);
    ctx.fillStyle = '#1f3a5f';
    ctx.font = '32px "Courier Prime", monospace';
    (p.direccion || []).slice(0, 2).forEach(function (l, i) { ctx.fillText(l, 700, 578 + i * 90); });

    grano(ctx, ANCHO, ALTO, 14);
    return c;
  }

  async function armarCaras(cfg) {
    var p = cfg.portada;
    // Las fuentes que solo usa el canvas no se bajan solas: se piden antes de dibujar
    if (document.fonts && document.fonts.load) {
      await Promise.all(['40px "IM Fell English"', 'italic 40px "IM Fell English"', '40px "Special Elite"', '40px "Courier Prime"']
        .map(function (f) { return document.fonts.load(f).catch(function () {}); }));
    }
    var cargas = await Promise.all([
      PP.cargarImagen(p.fondo),
      PP.cargarImagen(p.letras),
      PP.svgACanvas(PP.escudoSVG('#e3c88a'), 280),
      PP.svgACanvas(PP.selloSVG({ forma: 'circulo', arriba: cfg.agencia.toUpperCase(), abajo: cfg.fecha, centro: cfg.fecha.slice(-4), centroTam: 30, color: '#1f3a5f', semilla: 21 }), 256),
    ]);
    return { frente: texFrente(cfg, cargas[0], cargas[1]), dorso: texDorso(cfg, cargas[2], cargas[3]) };
  }

  function etiquetaAccesible(cfg) {
    var p = cfg.portada;
    return 'Postal. Frente: ' + p.saludo + ' ' + p.titulo + '. Dorso: ' + p.mensaje + ' Para: ' + p.para + '.';
  }

  // op: { alDarVuelta() } → { darVuelta(), salir(): Promise, destruir() }
  PP.Postal3D = async function (contenedor, cfg, op) {
    op = op || {};
    if (!PP.hayWebGL()) return null;
    var THREE = await PP.precargarThree();
    if (!THREE) return null;
    var caras = await armarCaras(cfg);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return null; }

    var C = PP.curvas;
    var reducir = PP.reducirMovimiento();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    var lienzoGl = renderer.domElement;
    lienzoGl.setAttribute('role', 'img');
    lienzoGl.setAttribute('aria-label', etiquetaAccesible(cfg));

    var escena = new THREE.Scene();
    var camara = new THREE.PerspectiveCamera(35, 1, 0.1, 50);

    escena.add(new THREE.HemisphereLight(0xfff4e0, 0x6b4a33, 1.7));
    var sol = new THREE.DirectionalLight(0xffffff, 1.9);
    sol.position.set(1.2, 5, 2.2);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    sol.shadow.camera.left = -2; sol.shadow.camera.right = 2;
    sol.shadow.camera.top = 2; sol.shadow.camera.bottom = -2;
    sol.shadow.radius = 6;
    escena.add(sol);

    var piso = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.3 }));
    piso.rotation.x = -Math.PI / 2;
    piso.receiveShadow = true;
    escena.add(piso);

    function canvasTex(c) {
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
      return t;
    }
    var matCanto = new THREE.MeshStandardMaterial({ color: 0xefe4c8, roughness: 0.9, transparent: true });
    var matFrente = new THREE.MeshStandardMaterial({ map: canvasTex(caras.frente), roughness: 0.75, transparent: true });
    var matDorso = new THREE.MeshStandardMaterial({ map: canvasTex(caras.dorso), roughness: 0.9, transparent: true });
    var materiales = [matCanto, matCanto, matCanto, matCanto, matFrente, matDorso];

    // postal (posición, inclinación) → acostada (sobre la mesa) → malla (se da vuelta)
    var postal = new THREE.Group();
    escena.add(postal);
    var acostada = new THREE.Group();
    acostada.rotation.x = -Math.PI / 2;
    postal.add(acostada);
    var malla = new THREE.Mesh(new THREE.BoxGeometry(W, H, GROSOR), materiales);
    malla.castShadow = true;
    acostada.add(malla);

    // ---------- Tamaño: la postal entra a lo ancho (celu) o a lo alto (compu) ----------
    var INCLINACION = 0.32; // la cámara mira desde un poco adelante, no del cenit
    function medir() {
      var w = contenedor.clientWidth || 320, h = contenedor.clientHeight || 400;
      renderer.setSize(w, h, false);
      lienzoGl.style.width = '100%';
      lienzoGl.style.height = '100%';
      camara.aspect = w / h;
      var tg = 2 * Math.tan((camara.fov * Math.PI) / 360);
      var lejos = Math.max(W / 0.94 / (tg * camara.aspect), H / 0.78 / tg);
      camara.position.set(0, lejos * Math.cos(INCLINACION), lejos * Math.sin(INCLINACION));
      camara.lookAt(0, 0, 0);
      camara.updateProjectionMatrix();
    }
    medir();
    var observador = window.ResizeObserver ? new ResizeObserver(medir) : null;
    if (observador) observador.observe(contenedor);

    // ---------- Darla vuelta: toque o arrastre horizontal ----------
    var angulo = 0, tween = null, dorsoVisto = false;
    var arrastre = null;           // { x, angulo, movio }
    var mirada = { x: 0, y: 0 };   // dónde está el puntero (-1..1)
    var mira = { x: 0, y: 0 };     // la inclinación, que lo sigue con retardo

    function girarA(destino, dur) {
      tween = { desde: angulo, hasta: destino, t0: performance.now(), dur: reducir ? 0 : dur };
    }
    function darVuelta() {
      var destino = (tween ? tween.hasta : Math.round(angulo / Math.PI) * Math.PI) + Math.PI;
      girarA(destino, 800);
    }
    function alTerminarGiro() {
      var cara = ((Math.round(angulo / Math.PI) % 2) + 2) % 2;
      if (cara === 1 && !dorsoVisto) {
        dorsoVisto = true;
        if (op.alDarVuelta) op.alDarVuelta();
      }
    }

    lienzoGl.style.touchAction = 'none';
    lienzoGl.addEventListener('pointerdown', function (e) {
      if (saliendo) return;
      arrastre = { x: e.clientX, angulo: angulo, movio: false };
      tween = null;
      try { lienzoGl.setPointerCapture(e.pointerId); } catch (er) { /* sin captura igual anda */ }
    });
    lienzoGl.addEventListener('pointermove', function (e) {
      var r = lienzoGl.getBoundingClientRect();
      mirada.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mirada.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!arrastre) return;
      var dx = e.clientX - arrastre.x;
      if (Math.abs(dx) > 6) arrastre.movio = true;
      if (arrastre.movio) angulo = arrastre.angulo + dx * 0.011;
    });
    function soltar(e) {
      if (!arrastre) return;
      var a = arrastre;
      arrastre = null;
      if (!a.movio) { if (e.type === 'pointerup') darVuelta(); else girarA(a.angulo, 300); return; }
      // Con un arrastre corto vuelve a su cara; con uno largo pasa a la siguiente
      var dx = e.clientX - a.x, base = Math.round(a.angulo / Math.PI) * Math.PI;
      var destino = Math.abs(dx) > 50 ? base + (dx > 0 ? Math.PI : -Math.PI) : base;
      girarA(destino, 450);
    }
    lienzoGl.addEventListener('pointerup', soltar);
    lienzoGl.addEventListener('pointercancel', soltar);
    lienzoGl.addEventListener('pointerleave', function () { mirada.x = mirada.y = 0; });

    // ---------- Animación ----------
    var inicio = performance.now();
    var saliendo = null;   // { t0, listo }
    var vivo = true;

    function cuadro(ahora) {
      var seg = ahora / 1000;
      var t = reducir ? 99999 : ahora - inicio;

      // 1) cae girando y se acomoda
      var p = C.tramo(t, 0, 1400), ap = C.atras(p);
      var caida = 1 - Math.pow(1 - p, 3);
      var y = 0.08 + 1.6 * (1 - caida);
      var x = 0.6 * Math.sin(p * Math.PI * 1.5) * (1 - p);
      var giroMesa = 1.1 * (1 - ap) - 0.06;
      var cabeceo = 0.9 * (1 - ap) * Math.cos(p * 6);

      // 2) en reposo flota apenas y mira hacia el puntero
      var reposo = reducir ? 0 : C.tramo(t, 1400, 2200);
      y += reposo * 0.03 * Math.sin(seg * 1.4);
      mira.x += ((reducir ? 0 : mirada.x) - mira.x) * 0.08;
      mira.y += ((reducir ? 0 : mirada.y) - mira.y) * 0.08;

      // 3) vuelta
      if (tween) {
        var k = tween.dur ? C.tramo(ahora - tween.t0, 0, tween.dur) : 1;
        angulo = tween.desde + (tween.hasta - tween.desde) * C.suave(k);
        if (k >= 1) { tween = null; alTerminarGiro(); }
      }
      y += 0.35 * Math.abs(Math.sin(angulo)); // se levanta para no rozar la mesa

      // 4) salida: sube hacia la cámara y se desvanece
      var opacidad = 1;
      if (saliendo) {
        var s = reducir ? 1 : C.tramo(ahora - saliendo.t0, 0, 700), ss = C.suave(s);
        y += 2.2 * ss;
        giroMesa += 0.6 * ss;
        opacidad = 1 - ss;
        if (s >= 1 && saliendo.listo) { var listo = saliendo.listo; saliendo.listo = null; listo(); }
      }
      matFrente.opacity = matDorso.opacity = matCanto.opacity = opacidad;

      postal.position.set(x, y, 0);
      postal.rotation.set(cabeceo + reposo * mira.y * 0.12, giroMesa - reposo * mira.x * 0.12, 0);
      malla.rotation.y = angulo;
      renderer.render(escena, camara);
    }

    function bucle(ahora) {
      if (!vivo) return;
      if (!document.hidden) cuadro(ahora);
      requestAnimationFrame(bucle);
    }

    contenedor.appendChild(lienzoGl);
    requestAnimationFrame(bucle);

    return {
      darVuelta: darVuelta,
      salir: function () {
        return new Promise(function (listo) { saliendo = { t0: performance.now(), listo: listo }; });
      },
      destruir: function () {
        vivo = false;
        if (observador) observador.disconnect();
        renderer.dispose();
        lienzoGl.remove();
      },
    };
  };

  // ---------- Sin WebGL: la misma postal en CSS 3D ----------
  PP.postalCSS = async function (contenedor, cfg, op) {
    op = op || {};
    var caras = await armarCaras(cfg);
    var raiz = document.createElement('div');
    raiz.className = 'postal-css';
    raiz.innerHTML = '<div class="postal-carta" role="img"><div class="cara frente"></div><div class="cara dorso"></div></div>';
    var carta = raiz.firstChild;
    carta.setAttribute('aria-label', etiquetaAccesible(cfg));
    carta.querySelector('.frente').appendChild(caras.frente);
    carta.querySelector('.dorso').appendChild(caras.dorso);
    var dorsoVisto = false;
    function darVuelta() {
      raiz.classList.toggle('dada-vuelta');
      if (raiz.classList.contains('dada-vuelta') && !dorsoVisto) {
        dorsoVisto = true;
        setTimeout(function () { if (op.alDarVuelta) op.alDarVuelta(); }, PP.reducirMovimiento() ? 0 : 800);
      }
    }
    carta.addEventListener('click', darVuelta);
    contenedor.appendChild(raiz);
    return {
      darVuelta: darVuelta,
      salir: function () {
        raiz.classList.add('saliendo');
        return new Promise(function (listo) { setTimeout(listo, PP.reducirMovimiento() ? 0 : 600); });
      },
      destruir: function () { raiz.remove(); },
    };
  };
})(globalThis.PP = globalThis.PP || {});
