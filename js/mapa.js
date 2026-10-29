// Mapa de caracteres en canvas: la tierra se escribe con letras, las fronteras son huecos
// y el mar son puntos que van de celeste (costa) a azul tinta (alta mar).
(function (PP) {
  'use strict';

  var COLOR_VISITADO = '#7a1f2b';
  var COLOR_OTRO = 'rgba(31, 58, 95, 0.78)';
  var COLOR_LAGO = '#5fb3d6';
  var MAR_CERCA = [143, 208, 232];
  var MAR_LEJOS = [15, 44, 76];

  var rad = function (g) { return (g * Math.PI) / 180; };
  var mercY = function (lat) { return Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2)); };

  // Fracción (0..1) de la posición de un punto dentro de la grilla
  PP.proyectar = function (datos, lat, lon) {
    var yMax = mercY(datos.latMax), yMin = mercY(datos.latMin);
    return {
      x: (lon - datos.lonMin) / (datos.lonMax - datos.lonMin),
      y: (yMax - mercY(lat)) / (yMax - yMin),
    };
  };

  function colorMar(d) {
    var t = Math.min(1, (d - 1) / 7);
    var c = MAR_CERCA.map(function (v, i) { return Math.round(v + (MAR_LEJOS[i] - v) * t); });
    return 'rgb(' + c.join(',') + ')';
  }

  PP.reducirMovimiento = function () {
    return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  function Mapa(contenedor, datos, opciones) {
    this.cont = contenedor;
    this.datos = datos;
    this.op = opciones || {};
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', this.op.etiqueta || 'Mapa');
    contenedor.insertBefore(this.canvas, contenedor.firstChild);
    this.ctx = this.canvas.getContext('2d');
    this.tierra = document.createElement('canvas');
    this.visible = true;
    this.t0 = performance.now();
    this.animar = this.op.animar !== false && !PP.reducirMovimiento();

    var self = this;
    this.medir();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('12px "Courier Prime"').then(function () { self.dibujarTierra(); self.cuadro(performance.now()); });
    }
    if (window.ResizeObserver) {
      var ancho = contenedor.clientWidth;
      new ResizeObserver(function () {
        if (Math.abs(contenedor.clientWidth - ancho) > 1) { ancho = contenedor.clientWidth; self.medir(); }
      }).observe(contenedor);
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; if (self.visible) self.arrancar(); })
        .observe(this.canvas);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.arrancar(); });
    this.arrancar();
  }

  Mapa.prototype.medir = function () {
    var d = this.datos;
    var ancho = this.cont.clientWidth || 340;
    this.celda = ancho / d.cols;
    this.ancho = ancho;
    this.alto = this.celda * d.rows;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    [this.canvas, this.tierra].forEach(function (c) {
      c.width = Math.round(ancho * this.dpr);
      c.height = Math.round(this.alto * this.dpr);
    }, this);
    this.canvas.style.height = this.alto + 'px';

    // Puntos de agua agrupados por color
    this.agua = {};
    for (var r = 0; r < d.rows; r++) {
      var fila = d.filas[r];
      for (var c = 0; c < d.cols; c++) {
        var s = fila[c];
        var clave = s === '~' ? 'lago' : s >= '1' && s <= '9' ? s : null;
        if (!clave) continue;
        (this.agua[clave] = this.agua[clave] || []).push(c, r);
      }
    }
    this.dibujarTierra();
    this.cuadro(performance.now());
  };

  Mapa.prototype.dibujarTierra = function () {
    var d = this.datos, ctx = this.tierra.getContext('2d'), cel = this.celda;
    var visitados = this.op.visitados || [];
    // Mayúsculas sin espacios: las letras llenan mejor la celda y la frase se sigue leyendo
    var texto = (this.op.textoTierra || '•').toUpperCase().replace(/\s+/g, '').replace(/·/g, '•') || '•';
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.ancho, this.alto);
    ctx.font = '700 ' + (cel * 1.12).toFixed(2) + 'px "Courier Prime", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var k = 0;
    for (var r = 0; r < d.rows; r++) {
      var fila = d.filas[r];
      for (var c = 0; c < d.cols; c++) {
        var s = fila[c];
        var pais = d.paises[s];
        if (!pais) continue;
        var ch = texto[k++ % texto.length];
        ctx.fillStyle = visitados.indexOf(pais) >= 0 ? COLOR_VISITADO : COLOR_OTRO;
        ctx.fillText(ch, (c + 0.5) * cel, (r + 0.55) * cel);
      }
    }
  };

  Mapa.prototype.cuadro = function (ahora) {
    var ctx = this.ctx, cel = this.celda;
    var t = (ahora - this.t0) / 1000;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.ancho, this.alto);
    var base = cel * 0.2;
    for (var clave in this.agua) {
      var pts = this.agua[clave];
      ctx.fillStyle = clave === 'lago' ? COLOR_LAGO : colorMar(+clave);
      ctx.beginPath();
      for (var i = 0; i < pts.length; i += 2) {
        var c = pts[i], r = pts[i + 1];
        var radio = base * (clave === 'lago' ? 1.25 : 1);
        if (this.animar) radio *= 0.82 + 0.28 * Math.sin(t * 1.5 - (c + r * 0.6) * 0.28);
        var x = (c + 0.5) * cel, y = (r + 0.5) * cel;
        ctx.moveTo(x + radio, y);
        ctx.arc(x, y, radio, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.tierra, 0, 0);
  };

  Mapa.prototype.arrancar = function () {
    if (!this.animar || this.corriendo) return;
    var self = this;
    var ultimo = 0;
    this.corriendo = true;
    function paso(ahora) {
      if (!self.visible || document.hidden || !self.cont.isConnected) { self.corriendo = false; return; }
      if (ahora - ultimo > 33) { self.cuadro(ahora); ultimo = ahora; } // ~30 fps alcanza para el oleaje
      requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  };

  PP.Mapa = Mapa;
})(globalThis.PP = globalThis.PP || {});
