// Tests sin dependencias: node tests/run.mjs
import { readFileSync } from 'node:fs';
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
await test('distribuir letras de la pista oculta', () => {
  igual(PP.posicionesPista(['Hola fiera', 'ramo'], 'FIRA'), [[0, 5], [0, 6], [0, 8], [1, 1]]);
  igual(PP.posicionesPista(['abc', 'xyz'], 'cx'), [[0, 2], [1, 0]]);
  igual(PP.posicionesPista(['Río'], 'i'), [[0, 1]]);
  igual(PP.posicionesPista(['abc'], 'z'), null);
});

console.log('config.js');
await test('cada desafío tiene respuesta y acepta la principal', () => {
  for (const d of CONFIG.desafios) {
    const validas = PP.respuestasDe(d).filter(Boolean);
    if (!validas.length) throw new Error(d.id + ' no tiene respuestas');
    if (!PP.verificar(d, validas[0])) throw new Error(d.id + ' no acepta su propia respuesta');
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
