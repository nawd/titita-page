// Tests sin dependencias: node tests/run.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const cargar = (ruta) => vm.runInThisContext(readFileSync(raiz + ruta, 'utf8'), { filename: ruta });

cargar('js/cripto.js');
cargar('js/logica.js');
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

// Respuestas de ejemplo documentadas en el README
const EJEMPLO = {
  'destino-1': 'Río de Janeiro',
  'destino-2': 'aventura',
  'destino-3': 'cordoba>florianopolis>mendoza>rio>salta',
  'destino-4': 'brujula',
};

console.log('normalizar');
await test('minúsculas y tildes', () => igual(PP.normalizar('Río DE Janéiro'), 'rio de janeiro'));
await test('ñ se vuelve n', () => igual(PP.normalizar('Ñandú'), 'nandu'));
await test('puntuación y espacios extra', () => igual(PP.normalizar('  ¡San   Andrés!, ¿no? '), 'san andres no'));
await test('guiones separan palabras', () => igual(PP.normalizar('rio-de-janeiro'), 'rio de janeiro'));
await test('vacío', () => igual(PP.normalizar(''), ''));

console.log('sha256');
await test('vector conocido "abc"', async () =>
  igual(await PP.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));

console.log('cifrado');
await test('ida y vuelta AES-GCM', async () => {
  const p = await PP.cifrar('hola valija', 'secreto', 1000);
  igual(await PP.descifrar(p, 'secreto'), 'hola valija');
});
await test('clave incorrecta falla', async () => {
  const p = await PP.cifrar('hola', 'secreto', 1000);
  let fallo = false;
  try { await PP.descifrar(p, 'otro'); } catch { fallo = true; }
  igual(fallo, true);
});

console.log('respuestas');
await test('canónica y variantes recuperan la canónica', async () => {
  const r = await PP.generarRespuestas('text', 'Río de Janeiro', ['rio', 'RJ']);
  igual(r.length, 3);
  igual(await PP.verificar(r, 'text', 'RIO DE JANEIRO!'), 'rio de janeiro');
  igual(await PP.verificar(r, 'text', 'Río'), 'rio de janeiro');
  igual(await PP.verificar(r, 'text', 'rj'), 'rio de janeiro');
  igual(await PP.verificar(r, 'text', 'paris'), null);
  igual(await PP.verificar(r, 'text', '   '), null);
});
await test('order compara ids tal cual', async () => {
  const r = await PP.generarRespuestas('order', 'a>b>c');
  igual(await PP.verificar(r, 'order', 'a>b>c'), 'a>b>c');
  igual(await PP.verificar(r, 'order', 'b>a>c'), null);
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
await test('distribuir letras de la pista oculta', () => {
  igual(PP.posicionesPista(['Hola fiera', 'ramo'], 'FIRA'), [[0, 5], [0, 6], [0, 8], [1, 1]]);
  igual(PP.posicionesPista(['abc', 'xyz'], 'cx'), [[0, 2], [1, 0]]);
  igual(PP.posicionesPista(['Río'], 'i'), [[0, 1]]);
  igual(PP.posicionesPista(['abc'], 'z'), null);
});

console.log('config de ejemplo');
await test('cada desafío acepta su respuesta de ejemplo', async () => {
  for (const d of CONFIG.desafios) {
    const c = await PP.verificar(d.respuestas, d.tipo, EJEMPLO[d.id]);
    if (!c) throw new Error(d.id + ' no acepta "' + EJEMPLO[d.id] + '"');
  }
});
await test('el final se descifra con las 4 canónicas', async () => {
  const canonicas = [];
  for (const d of CONFIG.desafios) canonicas.push(await PP.verificar(d.respuestas, d.tipo, EJEMPLO[d.id]));
  const final = await PP.descifrarFinal(CONFIG.final.cifrado, canonicas);
  if (!final.monto) throw new Error('sin monto');
});
await test('la palabra de la pista oculta entra en los textos', () => {
  const textos = PP.textosPista(CONFIG);
  if (!PP.posicionesPista(textos, CONFIG.pistaOculta.palabra)) throw new Error('no entra');
});

console.log(`\n${total - fallas}/${total} ok`);
process.exit(fallas ? 1 : 0);
