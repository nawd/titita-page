// Tests sin dependencias: node tests/run.mjs
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const cargar = (ruta) => vm.runInThisContext(readFileSync(raiz + ruta, 'utf8'), { filename: ruta });

cargar('js/respuestas.js');
cargar('js/logica.js');
cargar('js/desafios.js');
cargar('config.js');
const { PP, CONFIG } = globalThis;

let fallas = 0;
let total = 0;
async function test(nombre, fn) {
  total++;
  try {
    await fn();
    console.log('  ok  ' + nombre);
  } catch (e) {
    fallas++;
    console.log('  FALLA  ' + nombre + '\n        ' + (e && e.message));
  }
}
function igual(a, b) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error('esperaba ' + JSON.stringify(b) + ' y obtuve ' + JSON.stringify(a));
  }
}

console.log('normalizar');
await test('minúsculas y tildes', () => igual(PP.normalizar('Río DE Janéiro'), 'rio de janeiro'));
await test('ñ se vuelve n', () => igual(PP.normalizar('Ñandú'), 'nandu'));
await test('puntuación y espacios extra', () => igual(PP.normalizar('  ¡San   Andrés!, ¿no? '), 'san andres no'));
await test('guiones separan palabras', () => igual(PP.normalizar('rio-de-janeiro'), 'rio de janeiro'));
await test('vacío', () => igual(PP.normalizar(''), ''));

console.log('respuestas');
await test('cualquier respuesta válida devuelve la principal', () => {
  const d = { tipo: 'text', respuestas: ['Río de Janeiro', 'rio', 'RJ'] };
  igual(PP.verificar(d, 'RIO DE JANEIRO!'), 'rio de janeiro');
  igual(PP.verificar(d, 'Río'), 'rio de janeiro');
  igual(PP.verificar(d, 'rj'), 'rio de janeiro');
  igual(PP.verificar(d, 'paris'), null);
  igual(PP.verificar(d, '   '), null);
});
await test('order compara los ids en orden', () => {
  const d = { tipo: 'order', ordenCorrecto: ['a', 'b', 'c'] };
  igual(PP.verificar(d, 'a>b>c'), 'a>b>c');
  igual(PP.verificar(d, 'b>a>c'), null);
});
await test('memotest acepta la palabra clave', () => {
  const d = { tipo: 'memotest', palabraClave: 'AVENTURA', respuestas: [] };
  igual(PP.verificar(d, 'Aventura'), 'aventura');
  igual(PP.verificar(d, 'viaje'), null);
});

console.log('lógica');
await test('mensajes de error rotan', () => {
  const m = ['a', 'b', 'c'];
  igual([0, 1, 2, 3, 4].map((n) => PP.mensajeError(m, n)), ['a', 'b', 'c', 'a', 'b']);
});
await test('pistas se desbloquean a los 2 y 4 errores', () => {
  igual([0, 1, 2, 3, 4, 9].map(PP.pistasVisibles), [0, 0, 1, 1, 2, 2]);
});
await test('falsa derrota solo una vez al llegar al límite', () => {
  igual(PP.tocaFalsaDerrota({ errores: 5 }, 6, true), false);
  igual(PP.tocaFalsaDerrota({ errores: 6 }, 6, true), true);
  igual(PP.tocaFalsaDerrota({ errores: 6, falsaVista: true }, 6, true), false);
  igual(PP.tocaFalsaDerrota({ errores: 6 }, 6, false), false);
});
await test('mezclar conserva los elementos y no deja el orden correcto', () => {
  const orig = ['a', 'b', 'c', 'd', 'e'];
  for (let k = 0; k < 50; k++) {
    const m = PP.mezclarDistinto(orig);
    igual([...m].sort(), orig);
    if (m.join() === orig.join()) throw new Error('quedó en orden');
  }
});
await test('mezclar distinto funciona con objetos (sellos)', () => {
  const sellos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const m = PP.mezclarDistinto(sellos);
  igual(m.length, 3);
  if (m.every((x, i) => x === sellos[i])) throw new Error('quedó en orden');
});
await test('con rondas, cada ronda tiene sus respuestas', () => {
  const d = { tipo: 'blur', rondas: [{ respuestas: ['Traful', 'rio traful'] }, { respuestas: ['Quilmes'] }] };
  igual(PP.verificar(d, 'traful', { ronda: 0 }), 'traful');
  igual(PP.verificar(d, 'quilmes', { ronda: 0 }), null);
  igual(PP.verificar(d, 'Quilmes!', { ronda: 1 }), 'quilmes');
  igual(PP.verificar(d, 'quilmes', { ronda: 9 }), 'quilmes');
  igual(PP.verificar(d, 'traful'), 'traful');
});
await test('pistas por ronda cuentan solo los errores de esa ronda', () => {
  const d = { pistas: ['g1', 'g2'], rondas: [{ pistas: ['a1', 'a2'] }, { pistas: ['b1', 'b2'] }, {}] };
  igual(PP.pistasDe(d, { errores: 3, ronda: 0 }), { lista: ['a1', 'a2'], errores: 3 });
  igual(PP.pistasDe(d, { errores: 5, ronda: 1, baseRonda: 3 }), { lista: ['b1', 'b2'], errores: 2 });
  igual(PP.pistasDe(d, { errores: 5, ronda: 2, baseRonda: 5 }), { lista: ['g1', 'g2'], errores: 0 });
  igual(PP.pistasDe({ pistas: ['x'] }, { errores: 4 }), { lista: ['x'], errores: 4 });
});
await test('juegos sin input se sellan con JUEGO_COMPLETO', () => {
  for (const tipo of ['lancha', 'cerro']) {
    igual(PP.verificar({ tipo }, PP.JUEGO_COMPLETO), PP.normalizar(PP.JUEGO_COMPLETO));
    igual(PP.verificar({ tipo }, 'cualquier cosa'), null);
  }
});
await test('la lancha se bambolea entre -1 y 1 y pasa por el muelle seguido', () => {
  for (const paso of [0, 1, 2]) {
    let ventanaSinMuelle = 0;
    for (let t = 0; t < 30; t += 0.01) {
      const v = PP.vaivenLancha(t, paso);
      if (v < -1 || v > 1) throw new Error('fuera de rango: ' + v);
      ventanaSinMuelle = PP.enMuelle(v, 0.15) ? 0 : ventanaSinMuelle + 0.01;
      if (ventanaSinMuelle > 2.5) throw new Error('más de 2.5 s sin pasar por el muelle (paso ' + paso + ')');
    }
  }
});
await test('enMuelle respeta la tolerancia', () => {
  igual([0, 0.1, -0.15, 0.2, -0.9].map((v) => PP.enMuelle(v, 0.15)), [true, true, true, false, false]);
});
await test('el cerro sube con aciertos y resbala con errores, sin pasarse', () => {
  igual(PP.tramoTras(0, true, 3), 1);
  igual(PP.tramoTras(3, true, 3), 3);
  igual(PP.tramoTras(2, false, 3), 1);
  igual(PP.tramoTras(0, false, 3), 0);
});
await test('fracción limpia del barro (canal alfa)', () => {
  const px = (alfas) => Uint8ClampedArray.from(alfas.flatMap((a) => [90, 60, 30, a]));
  igual(PP.fraccionLimpia(px([255, 255, 255, 255]), 1), 0);
  igual(PP.fraccionLimpia(px([0, 0, 0, 0]), 1), 1);
  igual(PP.fraccionLimpia(px([0, 255, 10, 255]), 1), 0.5);
  igual(PP.fraccionLimpia(px([0, 255, 0, 255]), 2), 1);
});
await test('el oleaje avanza: la cresta de un momento está más adelante después', () => {
  // A lo largo de una fila, la cresta (punto más grande) se corre con el tiempo
  const cresta = (t) => { let mejor = 0, col = 0; for (let c = 0; c < 18; c++) { const e = PP.oleaje(c, 50, t).escala; if (e > mejor) { mejor = e; col = c; } } return col; };
  const a = cresta(0), b = cresta(0.4);
  if (a === b) throw new Error('la cresta no se mueve');
});
await test('el oleaje mueve poco cada punto del mar', () => {
  for (let t = 0; t < 10; t += 0.37) {
    for (const [c, r] of [[0, 0], [12, 40], [59, 98]]) {
      const o = PP.oleaje(c, r, t);
      if (Math.abs(o.x) > 0.3 || Math.abs(o.y) > 0.3) throw new Error('se mueve demasiado: ' + JSON.stringify(o));
      if (o.escala < 0.5 || o.escala > 1.15) throw new Error('escala rara: ' + o.escala);
    }
  }
});
await test('el puntero hace un agujero sutil: empuja un poco y achica sin borrar, lejos no toca', () => {
  igual(PP.empujeAgua(100, 0, 50), { x: 0, y: 0, escala: 1 });
  const cerca = PP.empujeAgua(10, 0, 50);
  if (!(cerca.x > 0 && cerca.y === 0)) throw new Error('no empuja hacia afuera: ' + JSON.stringify(cerca));
  if (!(cerca.escala < 0.9 && cerca.escala >= 0.5)) throw new Error('cerca del centro tiene que achicar un poco: ' + cerca.escala);
  if (!(cerca.x < 50 * 0.4)) throw new Error('empuja demasiado: ' + cerca.x);
  if (!(PP.empujeAgua(0, 0, 50).escala >= 0.5)) throw new Error('en el centro los puntos no desaparecen');
  const masLejos = PP.empujeAgua(0, -40, 50);
  if (!(masLejos.y < 0 && Math.abs(masLejos.y) < cerca.x)) throw new Error('el empuje no baja con la distancia');
  const centro = PP.empujeAgua(0, 0, 50);
  if (!isFinite(centro.x) || !isFinite(centro.y)) throw new Error('en el centro da NaN');
});
await test('la onda de un toque es un anillo que se expande y se apaga', () => {
  const vel = 100, ancho = 10;
  igual(PP.onda(0, 0.5, vel, ancho, 1.5), 0); // el centro ya quedó atrás
  if (!(PP.onda(50, 0.5, vel, ancho, 1.5) > 0)) throw new Error('el anillo no empuja');
  igual(PP.onda(50, 2, vel, ancho, 1.5), 0); // ya se apagó
  if (!(PP.onda(50, 0.5, vel, ancho, 1.5) > PP.onda(130, 1.3, vel, ancho, 1.5))) throw new Error('no pierde fuerza');
});
await test('distribuir letras de la pista oculta', () => {
  igual(PP.posicionesPista(['Hola fiera', 'ramo'], 'FIRA'), [[0, 5], [0, 6], [0, 8], [1, 1]]);
  igual(PP.posicionesPista(['abc', 'xyz'], 'cx'), [[0, 2], [1, 0]]);
  igual(PP.posicionesPista(['Río'], 'i'), [[0, 1]]);
  igual(PP.posicionesPista(['abc'], 'z'), null);
});

console.log('config.js');
await test('cada desafío (y cada ronda) tiene respuesta y acepta la principal', () => {
  for (const d of CONFIG.desafios) {
    (d.rondas || [null]).forEach((_, ronda) => {
      const est = { ronda };
      const validas = PP.respuestasDe(d, est).filter(Boolean);
      if (!validas.length) throw new Error(d.id + ' (ronda ' + (ronda + 1) + ') no tiene respuestas');
      if (!PP.verificar(d, validas[0], est)) throw new Error(d.id + ' no acepta su propia respuesta');
    });
  }
});
await test('todas las imágenes de config.js existen', () => {
  const rutas = JSON.stringify(CONFIG).match(/assets\/[^"]+\.(svg|jpe?g|png|webp)/g) || [];
  const faltan = rutas.filter((r) => !existsSync(raiz + r));
  if (faltan.length) throw new Error('faltan: ' + faltan.join(', '));
});
await test('los recuerdos del mapa dependen de desafíos que existen', () => {
  const ids = CONFIG.desafios.map((d) => d.id);
  for (const r of CONFIG.mapa.recuerdos || []) {
    for (const idD of r.tras || CONFIG.mapa.recuerdosTras || []) {
      if (!ids.includes(idD)) throw new Error(r.lugar + ': no existe el desafío ' + idD);
    }
  }
});
await test('el orden correcto usa todos los sellos y ninguno de más', () => {
  for (const d of CONFIG.desafios.filter((x) => x.tipo === 'order')) {
    igual([...d.ordenCorrecto].sort(), d.sellos.map((s) => s.id).sort());
  }
});
await test('cada desafío tiene un tipo conocido', () => {
  for (const d of CONFIG.desafios) {
    if (typeof PP.Desafios[d.tipo] !== 'function') throw new Error(d.id + ': tipo desconocido "' + d.tipo + '"');
  }
});
await test('las preguntas del cerro tienen la correcta entre sus opciones', () => {
  for (const d of CONFIG.desafios.filter((x) => x.tipo === 'cerro')) {
    if (!d.preguntas || !d.preguntas.length) throw new Error(d.id + ' sin preguntas');
    d.preguntas.forEach((p, k) => {
      if (!(p.opciones || [])[p.correcta]) throw new Error(d.id + ': la pregunta ' + (k + 1) + ' no tiene su opción correcta');
    });
  }
});
await test('el microtexto del cheque es una respuesta válida', () => {
  const ok = CONFIG.desafios.some((d) => d.tipo === 'text' && PP.verificar(d, CONFIG.cheque.microtexto));
  if (!ok) throw new Error('"' + CONFIG.cheque.microtexto + '" no es respuesta de ningún desafío de texto');
});
await test('el final tiene monto y mensaje', () => {
  if (!isFinite(Number(CONFIG.final.monto))) throw new Error('monto inválido');
  if (!CONFIG.final.mensaje) throw new Error('falta el mensaje');
});
await test('la palabra de la pista oculta entra en los textos', () => {
  const textos = PP.textosPista(CONFIG);
  if (!PP.posicionesPista(textos, CONFIG.pistaOculta.palabra)) throw new Error('no entra');
});

console.log(`\n${total - fallas}/${total} ok`);
process.exit(fallas ? 1 : 0);
