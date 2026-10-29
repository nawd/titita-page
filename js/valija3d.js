// Valija 3D del final (Three.js desde CDN, se carga solo al llegar al final).
// Cae sobre el pasaporte, se abre y de adentro sale el cheque. Lleva los sellos como calcos
// y la etiqueta del sobre colgando de la manija.
// Si no hay WebGL o no carga Three.js, devuelve null y el final sigue en 2D.
(function (PP) {
  'use strict';

  var URL_THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

  // Medidas de la valija (metros "de juguete")
  var W = 1.6, D = 1.0, ALTO_BASE = 0.42, ALTO_TAPA = 0.24;
  var BORDO = 0x7a1f2b, CUERO = 0x8a5a2b, ORO = 0xc9a45c;

  var cargaThree = null;
  PP.precargarThree = function () {
    if (!cargaThree) cargaThree = import(URL_THREE).catch(function () { return null; });
    return cargaThree;
  };

  function hayWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function cargarImagen(src) {
    return new Promise(function (listo) {
      var img = new Image();
      img.onload = function () { listo(img); };
      img.onerror = function () { listo(null); };
      img.src = src;
    });
  }

  function lienzo(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // ---------- Texturas dibujadas en canvas ----------
  function texCuero() {
    var c = lienzo(256, 256), ctx = c.getContext('2d');
    var datos = ctx.createImageData(256, 256);
    for (var i = 0; i < datos.data.length; i += 4) {
      var v = 150 + Math.random() * 70;
      datos.data[i] = datos.data[i + 1] = datos.data[i + 2] = v;
      datos.data[i + 3] = 255;
    }
    ctx.putImageData(datos, 0, 0);
    return c;
  }

  function texForro() {
    var c = lienzo(256, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#e9dcbc';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(122, 31, 43, 0.25)';
    ctx.lineWidth = 2;
    for (var k = -256; k < 512; k += 32) {
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + 256, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k + 256, 0); ctx.lineTo(k, 256); ctx.stroke();
    }
    return c;
  }

  function texCheque(cfg) {
    var c = lienzo(1000, 400), ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 1000, 400);
    g.addColorStop(0, '#dfeef0'); g.addColorStop(0.5, '#f3ead3'); g.addColorStop(1, '#efe0bd');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1000, 400);
    // guilloché
    ctx.strokeStyle = 'rgba(47, 84, 128, 0.25)';
    ctx.lineWidth = 1;
    for (var capa = 0; capa < 3; capa++) {
      var R = 150 - capa * 35, r = 40 - capa * 8, d = 60 - capa * 15;
      ctx.beginPath();
      for (var t = 0; t <= Math.PI * 2 * 13; t += 0.03) {
        var x = 640 + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
        var y = 200 + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(31, 58, 95, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, 972, 372);
    ctx.fillStyle = '#7a1f2b';
    ctx.font = '58px "IM Fell English", Georgia, serif';
    ctx.fillText(cfg.agencia, 44, 92);
    ctx.fillStyle = '#1f3a5f';
    ctx.font = '26px "Special Elite", monospace';
    ctx.fillText('Páguese a', 44, 200);
    ctx.font = 'italic 64px "IM Fell English", Georgia, serif';
    ctx.fillText(cfg.nombre, 200, 204);
    ctx.fillRect(44, 222, 560, 3);
    ctx.lineWidth = 4;
    ctx.strokeRect(640, 150, 316, 90);
    ctx.font = '54px "Special Elite", monospace';
    ctx.fillStyle = '#7a1f2b';
    ctx.fillText('$ ????', 668, 214);
    ctx.fillStyle = '#7a1f2b';
    ctx.font = '24px "Special Elite", monospace';
    ctx.fillText(cfg.cheque.leyenda, 44, 340);
    ctx.fillStyle = '#1f3a5f';
    ctx.font = '22px "Special Elite", monospace';
    ctx.fillText('N° ' + cfg.numeroCheque, 800, 70);
    return c;
  }

  function texEtiqueta(titulo, texto, chico, pie) {
    var w = 280, h = 480;
    var c = lienzo(w, h), ctx = c.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(60, 0); ctx.lineTo(w - 60, 0); ctx.lineTo(w, 60); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.lineTo(0, 60);
    ctx.closePath();
    ctx.fillStyle = '#e3c99b';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#7a1f2b';
    ctx.fillRect(0, 110, w, 34);
    ctx.restore();
    // agujero con refuerzo
    ctx.fillStyle = '#c9a46a';
    ctx.beginPath(); ctx.arc(w / 2, 52, 26, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(w / 2, 52, 15, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3b2a18';
    ctx.font = '24px "Special Elite", monospace';
    ctx.fillText(titulo, w / 2, 200);
    ctx.fillStyle = '#7a1f2b';
    ctx.font = 'italic ' + (chico ? 44 : 62) + 'px "IM Fell English", Georgia, serif';
    ctx.fillText(texto, w / 2, chico ? 290 : 300);
    ctx.fillStyle = '#3b2a18';
    ctx.font = '18px "Special Elite", monospace';
    ctx.fillText(pie, w / 2, 440);
    return c;
  }

  function texPolaroid(img, pie) {
    var c = lienzo(300, 340), ctx = c.getContext('2d');
    ctx.fillStyle = '#fbf8ef';
    ctx.fillRect(0, 0, 300, 340);
    if (img) {
      var lado = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
      var sx = ((img.naturalWidth || img.width) - lado) / 2, sy = ((img.naturalHeight || img.height) - lado) / 2;
      ctx.drawImage(img, sx, sy, lado, lado, 18, 18, 264, 264);
    } else {
      ctx.fillStyle = '#9cc9e6';
      ctx.fillRect(18, 18, 264, 264);
    }
    ctx.fillStyle = '#1f3a5f';
    ctx.font = 'italic 26px "IM Fell English", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(pie, 150, 322);
    return c;
  }

  async function texSello(svg, tam) {
    tam = tam || 256;
    var c = lienzo(tam, tam);
    var conTam = svg.replace('<svg ', '<svg width="' + tam + '" height="' + tam + '" ');
    var img = await cargarImagen('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(conTam));
    if (img) c.getContext('2d').drawImage(img, 0, 0, tam, tam);
    return c;
  }

  // [x, z, giro] de cada calco: la mitad (redondeando para arriba) atrás, el resto adelante
  function lugaresSellos(n) {
    var giros = [0.25, -0.3, 0.4, -0.15, 0.1, -0.35, 0.3, -0.2];
    var fila1 = Math.ceil(n / 2), lugares = [];
    for (var k = 0; k < n; k++) {
      var enFila = k < fila1 ? fila1 : n - fila1, j = k < fila1 ? k : k - fila1;
      var paso = Math.min(0.4, 1.4 / enFila);
      lugares.push([(j - (enFila - 1) / 2) * paso, k < fila1 ? -0.22 : 0.22, giros[k]]);
    }
    return lugares;
  }

  // ---------- Curvas ----------
  function rebote(x) {
    var n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  }
  function suave(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function atras(x) { var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function tramo(t, a, b) { return Math.min(1, Math.max(0, (t - a) / (b - a))); }

  // Compartidos con la postal de la portada
  PP.hayWebGL = hayWebGL;
  PP.cargarImagen = cargarImagen;
  PP.lienzo = lienzo;
  PP.svgACanvas = texSello;
  PP.curvas = { rebote: rebote, suave: suave, atras: atras, tramo: tramo };

  // op: { sellos: [svg...], foto: src, pieFoto, alAterrizar(), alAbrir() }
  PP.Valija3D = async function (contenedor, cfg, op) {
    op = op || {};
    if (!hayWebGL()) return null;
    var THREE = await PP.precargarThree();
    if (!THREE) return null;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return null; }

    var reducir = PP.reducirMovimiento();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Una valija que se abre y de adentro sale el cheque');
    contenedor.appendChild(renderer.domElement);

    var escena = new THREE.Scene();
    var camara = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    var mira = new THREE.Vector3(0, 0.45, 0);

    // Luces
    escena.add(new THREE.HemisphereLight(0xfff4e0, 0x6b4a33, 1.6));
    var sol = new THREE.DirectionalLight(0xffffff, 2.2);
    sol.position.set(2.2, 4.5, 3);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    sol.shadow.camera.left = -2; sol.shadow.camera.right = 2;
    sol.shadow.camera.top = 2; sol.shadow.camera.bottom = -2;
    sol.shadow.radius = 4;
    escena.add(sol);
    var brillo = new THREE.PointLight(0xffd59a, 0, 3, 1.5);
    brillo.position.set(0, ALTO_BASE + 0.35, 0.1);
    escena.add(brillo);

    var piso = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.18 }));
    piso.rotation.x = -Math.PI / 2;
    piso.receiveShadow = true;
    escena.add(piso);

    // Materiales
    function canvasTex(c, color) {
      var t = new THREE.CanvasTexture(c);
      if (color) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    }
    var rugosidad = canvasTex(texCuero());
    rugosidad.wrapS = rugosidad.wrapT = THREE.RepeatWrapping;
    rugosidad.repeat.set(3, 3);
    var matCuerpo = new THREE.MeshStandardMaterial({ color: BORDO, roughness: 0.6, roughnessMap: rugosidad, bumpMap: rugosidad, bumpScale: 0.004 });
    var matCorrea = new THREE.MeshStandardMaterial({ color: CUERO, roughness: 0.75 });
    var matOro = new THREE.MeshStandardMaterial({ color: ORO, metalness: 0.9, roughness: 0.3 });
    var forro = canvasTex(texForro(), true);
    forro.wrapS = forro.wrapT = THREE.RepeatWrapping;
    forro.repeat.set(3, 2);
    var matForro = new THREE.MeshStandardMaterial({ map: forro, roughness: 0.9 });

    function cajaRedondeada(w, h, d, r) {
      var s = new THREE.Shape();
      var x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      var bisel = 0.025;
      var g = new THREE.ExtrudeGeometry(s, { depth: d - bisel * 2, bevelEnabled: true, bevelSize: bisel, bevelThickness: bisel, bevelSegments: 3, curveSegments: 6 });
      g.translate(0, 0, -(d - bisel * 2) / 2);
      return g;
    }
    function malla(geo, mat, sombra) {
      var m = new THREE.Mesh(geo, mat);
      m.castShadow = sombra !== false;
      m.receiveShadow = true;
      return m;
    }

    // ---------- Valija ----------
    var valija = new THREE.Group();
    escena.add(valija);

    // Base: el canto redondeado va en el plano X-Y (frente), profundidad en Z
    var base = malla(cajaRedondeada(W, ALTO_BASE, D, 0.07), matCuerpo);
    base.position.y = ALTO_BASE / 2;
    valija.add(base);

    var forroBase = malla(new THREE.PlaneGeometry(W - 0.12, D - 0.12), matForro, false);
    forroBase.rotation.x = -Math.PI / 2;
    forroBase.position.y = ALTO_BASE + 0.027;
    valija.add(forroBase);

    // Tapa con bisagra atrás
    var bisagra = new THREE.Group();
    bisagra.position.set(0, ALTO_BASE + 0.01, -D / 2);
    valija.add(bisagra);
    var tapa = new THREE.Group();
    tapa.position.set(0, ALTO_TAPA / 2, D / 2);
    bisagra.add(tapa);
    tapa.add(malla(cajaRedondeada(W, ALTO_TAPA, D, 0.06), matCuerpo));
    var forroTapa = malla(new THREE.PlaneGeometry(W - 0.12, D - 0.12), matForro, false);
    forroTapa.rotation.x = Math.PI / 2;
    forroTapa.position.y = -ALTO_TAPA / 2 - 0.027;
    tapa.add(forroTapa);

    // Correas + hebillas
    [-0.45, 0.45].forEach(function (x) {
      var arriba = malla(new THREE.BoxGeometry(0.12, 0.012, D + 0.03), matCorrea);
      arriba.position.set(x, ALTO_TAPA / 2 + 0.03, 0);
      tapa.add(arriba);
      var frenteTapa = malla(new THREE.BoxGeometry(0.12, ALTO_TAPA + 0.04, 0.012), matCorrea);
      frenteTapa.position.set(x, 0.01, D / 2 + 0.03);
      tapa.add(frenteTapa);
      var frenteBase = malla(new THREE.BoxGeometry(0.12, ALTO_BASE - 0.06, 0.012), matCorrea);
      frenteBase.position.set(x, ALTO_BASE / 2 + 0.03, D / 2 + 0.03);
      valija.add(frenteBase);
      var hebilla = malla(new THREE.BoxGeometry(0.15, 0.07, 0.02), matOro);
      hebilla.position.set(x, ALTO_BASE - 0.02, D / 2 + 0.04);
      valija.add(hebilla);
    });

    // Cierres que se abren
    var cierres = [-0.18, 0.18].map(function (x) {
      var pivote = new THREE.Group();
      pivote.position.set(x, ALTO_BASE - 0.06, D / 2 + 0.035);
      var pieza = malla(new THREE.BoxGeometry(0.09, 0.1, 0.025), matOro);
      pieza.position.y = 0.05;
      pivote.add(pieza);
      valija.add(pivote);
      return pivote;
    });

    // Esquineros dorados
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (p) {
      var esq = malla(new THREE.SphereGeometry(0.045, 12, 8), matOro);
      esq.position.set(p[0] * (W / 2 - 0.02), 0.04, p[1] * (D / 2 - 0.02));
      valija.add(esq);
      var esqTapa = malla(new THREE.SphereGeometry(0.04, 12, 8), matOro);
      esqTapa.position.set(p[0] * (W / 2 - 0.02), ALTO_TAPA / 2 - 0.02, p[1] * (D / 2 - 0.02));
      tapa.add(esqTapa);
    });

    // Manija al frente
    var manija = malla(new THREE.TorusGeometry(0.15, 0.028, 10, 24, Math.PI), matCorrea);
    manija.rotation.x = Math.PI / 2;
    manija.position.set(0, ALTO_BASE - 0.1, D / 2 + 0.03);
    valija.add(manija);

    // Etiqueta colgando de la manija (frente: su nombre; dorso: el destino)
    var etiqueta = new THREE.Group();
    etiqueta.position.set(0, ALTO_BASE - 0.1, D / 2 + 0.18);
    valija.add(etiqueta);
    var hilo = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.06, 6), new THREE.MeshStandardMaterial({ color: 0x7a1f2b }));
    hilo.position.y = -0.03;
    etiqueta.add(hilo);
    var et = cfg.cheque.etiqueta;
    var ancho = 0.17, largo = 0.27;
    var matEtFrente = new THREE.MeshStandardMaterial({ map: canvasTex(texEtiqueta(et.frente.toUpperCase(), cfg.nombre, false, cfg.agencia), true), transparent: true, alphaTest: 0.5, roughness: 0.9 });
    var matEtDorso = new THREE.MeshStandardMaterial({ map: canvasTex(texEtiqueta(et.dorsoTitulo.toUpperCase(), 'Los lagos', true, cfg.agencia), true), transparent: true, alphaTest: 0.5, roughness: 0.9 });
    var etFrente = malla(new THREE.PlaneGeometry(ancho, largo), matEtFrente);
    etFrente.position.y = -0.06 - largo / 2 + 0.02;
    etiqueta.add(etFrente);
    var etDorso = malla(new THREE.PlaneGeometry(ancho, largo), matEtDorso);
    etDorso.position.copy(etFrente.position);
    etDorso.rotation.y = Math.PI;
    etiqueta.add(etDorso);

    // Calcos de los sellos en la tapa: dos filas, por encima de las correas
    var lugares = lugaresSellos(Math.min((op.sellos || []).length, 8));
    var lado = lugares.length > 4 ? 0.3 : 0.36;
    for (var k = 0; k < lugares.length; k++) {
      var tex = canvasTex(await texSello(op.sellos[k]), true);
      var calco = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado),
        new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }));
      calco.rotation.x = -Math.PI / 2;
      calco.rotation.z = lugares[k][2];
      calco.position.set(lugares[k][0], ALTO_TAPA / 2 + 0.04, lugares[k][1]);
      tapa.add(calco);
    }

    // Polaroid del próximo viaje pegada en el forro de la tapa
    if (op.foto) {
      var img = await cargarImagen(op.foto);
      var polaroid = malla(new THREE.PlaneGeometry(0.3, 0.34), new THREE.MeshStandardMaterial({ map: canvasTex(texPolaroid(img, op.pieFoto || ''), true), roughness: 0.7 }), false);
      polaroid.rotation.x = Math.PI / 2;
      polaroid.rotation.z = 0.12;
      polaroid.position.set(0.35, -ALTO_TAPA / 2 - 0.03, 0.05);
      tapa.add(polaroid);
    }

    // El cheque adentro
    var matCheque = new THREE.MeshStandardMaterial({ map: canvasTex(texCheque(cfg), true), roughness: 0.6, transparent: true, side: THREE.DoubleSide });
    var cheque = malla(new THREE.PlaneGeometry(1.15, 0.46), matCheque);
    cheque.rotation.x = -Math.PI / 2;
    cheque.position.set(-0.1, ALTO_BASE + 0.035, 0);
    valija.add(cheque);

    // ---------- Tamaño (se adapta al ancho del celu) ----------
    function medir() {
      var w = contenedor.clientWidth || 320;
      var h = Math.round(w * 0.92);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = h + 'px';
      camara.aspect = w / h;
      // en pantallas angostas la cámara se aleja para que entre todo
      var lejos = w < 420 ? 4.3 : 3.9;
      camara.position.set(0, 2.25, lejos);
      camara.lookAt(mira);
      camara.updateProjectionMatrix();
    }
    medir();
    if (window.ResizeObserver) new ResizeObserver(medir).observe(contenedor);

    // ---------- Girar con el dedo (sin bloquear el scroll vertical) ----------
    var giroUsuario = 0, velocidad = 0, arrastrando = false, xPrevio = 0;
    var lienzoGl = renderer.domElement;
    lienzoGl.style.touchAction = 'pan-y';
    lienzoGl.addEventListener('pointerdown', function (e) { arrastrando = true; xPrevio = e.clientX; });
    window.addEventListener('pointermove', function (e) {
      if (!arrastrando) return;
      var dx = e.clientX - xPrevio;
      xPrevio = e.clientX;
      giroUsuario += dx * 0.012;
      velocidad = dx * 0.012;
    });
    window.addEventListener('pointerup', function () { arrastrando = false; });
    lienzoGl.addEventListener('pointercancel', function () { arrastrando = false; });

    // ---------- Animación ----------
    var inicio = null;        // ms cuando arranca la secuencia
    var avisos = {};
    var alSalirCheque = null;
    var visible = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(lienzoGl);
    }

    valija.position.y = 3;     // escondida arriba hasta que arranca
    valija.rotation.y = -0.5;

    function aviso(nombre, fn) { if (!avisos[nombre]) { avisos[nombre] = true; if (fn) fn(); } }

    function cuadro(ahora) {
      var seg = ahora / 1000;
      var t = inicio == null ? -1 : (reducir ? 99999 : ahora - inicio);

      if (t >= 0) {
        // 1) cae con rebote
        var caida = tramo(t, 0, 1000);
        valija.position.y = 3 * (1 - rebote(caida));
        if (caida >= 0.36) aviso('golpe', op.alAterrizar);
        // 2) los cierres saltan
        var c = tramo(t, 1050, 1350);
        cierres.forEach(function (p) { p.rotation.x = -1.1 * suave(c); });
        // 3) se abre la tapa
        var a = tramo(t, 1350, 2450);
        bisagra.rotation.x = -1.95 * atras(a);
        brillo.intensity = 2.6 * suave(a);
        if (a > 0.3) aviso('abre', op.alAbrir);
        // 4) el cheque sube y mira a la cámara
        var s = tramo(t, 2300, 3500);
        var ss = suave(s);
        cheque.position.y = ALTO_BASE + 0.035 + 0.75 * ss + (s >= 1 ? Math.sin(seg * 2) * 0.02 : 0);
        cheque.position.z = 0.15 * ss;
        cheque.rotation.x = -Math.PI / 2 + (Math.PI / 2 - 0.42) * ss;
        cheque.rotation.z = 0.25 * Math.sin(ss * Math.PI) * 0.4;
        // 5) vuela hacia la pantalla y se convierte en el cheque de verdad
        var v = tramo(t, 3600, 4300);
        if (v > 0) {
          cheque.position.y += 0.7 * suave(v);
          cheque.position.z += 2.4 * suave(v);
          matCheque.opacity = 1 - suave(v);
          aviso('cheque', alSalirCheque);
        }
        cheque.visible = matCheque.opacity > 0.01;
        if (reducir) aviso('cheque', alSalirCheque);
      }

      // Giro suave + el que le da ella con el dedo
      if (!arrastrando) { giroUsuario += velocidad; velocidad *= 0.92; }
      var base0 = t >= 0 ? -0.5 + 0.28 * suave(tramo(t, 0, 2400)) : -0.5;
      valija.rotation.y = base0 + (reducir ? 0 : 0.12 * Math.sin(seg * 0.5)) + giroUsuario;

      // La etiqueta se hamaca (más fuerte cuando la valija toca el piso)
      var golpe = t >= 0 ? Math.max(0, (t - 360) / 1000) : 0;
      var amp = t >= 360 ? 0.55 * Math.exp(-golpe * 0.9) : 0;
      etiqueta.rotation.x = (reducir ? 0 : 0.06 * Math.sin(seg * 1.7)) + amp * Math.sin(golpe * 7);
      etiqueta.rotation.z = (reducir ? 0 : 0.05 * Math.sin(seg * 1.1)) + amp * 0.5 * Math.sin(golpe * 5);

      renderer.render(escena, camara);
    }

    var vivo = true;
    function bucle(ahora) {
      if (!vivo) return;
      if (visible && !document.hidden) cuadro(ahora);
      requestAnimationFrame(bucle);
    }
    requestAnimationFrame(bucle);

    return {
      // Arranca la secuencia; la promesa se resuelve cuando el cheque sale volando de la valija
      abrir: function () {
        return new Promise(function (listo) {
          alSalirCheque = listo;
          inicio = performance.now();
        });
      },
      destruir: function () {
        vivo = false;
        renderer.dispose();
        lienzoGl.remove();
      },
    };
  };
})(globalThis.PP = globalThis.PP || {});
