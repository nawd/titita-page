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
  PP.Desafios.blur = function (zona, d, est) {
    zona.innerHTML = '<figure class="foto-blur"><img alt="Foto misteriosa de un lugar"><figcaption></figcaption></figure>';
    var img = zona.querySelector('img');
    var cap = zona.querySelector('figcaption');
    var total = d.imagenes.length;
    function actualizar() {
      var n = est.hecho ? total - 1 : Math.min(est.errores, total - 2);
      if (img.getAttribute('src') !== d.imagenes[n]) img.src = d.imagenes[n];
      cap.textContent = est.hecho ? '¡Nítida!' : 'Desenfoque nivel ' + (total - 1 - n);
      if (!est.hecho && n + 1 < total - 1) new Image().src = d.imagenes[n + 1];
    }
    actualizar();
    return { conFormulario: true, actualizar: actualizar };
  };

  // ---------- Memotest ----------
  PP.Desafios.memotest = function (zona, d, est, api) {
    function mostrarPalabra(animar) {
      var p = document.createElement('div');
      p.className = 'palabra-clave' + (animar ? ' revela' : '');
      p.innerHTML = 'El banco te dicta la palabra clave:<b>' + esc(d.palabraClave) + '</b>';
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
    return { conFormulario: false };
  };

  // ---------- Ordenar sellos ----------
  PP.Desafios.order = function (zona, d, est, api) {
    var porId = {};
    d.sellos.forEach(function (s) { porId[s.id] = s; });
    var orden = est.hecho && est.canonica
      ? est.canonica.split('>').map(function (idS) { return porId[idS]; }).filter(Boolean)
      : PP.mezclarDistinto(d.sellos);

    var lista = document.createElement('ol');
    lista.className = 'lista-orden';
    zona.appendChild(lista);

    var colores = ['#1f3a5f', '#7a1f2b', '#2f6b45', '#5b3a7a', '#8a5a1f'];
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

  // ---------- Texto simple ----------
  PP.Desafios.text = function (zona) {
    zona.innerHTML = '<p class="enunciado" style="text-align:center;font-size:40px;margin:4px 0" aria-hidden="true">🫴✉️</p>';
    return { conFormulario: true };
  };
})(globalThis.PP = globalThis.PP || {});
