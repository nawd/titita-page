// Exporta el frente y el dorso del cheque a .webp para imprimir (20 × 8 cm a 300 dpi = 2362 × 945 px).
// Uso: node tools/cheque-webp.mjs   (necesita Chrome o Edge instalado e internet para las fuentes y el QR)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const salida = raiz + 'assets/img/cheque/';
const DPI = 300;
const PUERTO = 9333;
const PIEZAS = [
  { selector: '.corte .cheque', archivo: 'cheque-frente.webp' },
  { selector: '.dorso', archivo: 'cheque-dorso.webp' },
];
const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Cliente CDP mínimo sobre el WebSocket nativo de Node
function conectar(url) {
  const ws = new WebSocket(url);
  let n = 0;
  const pendientes = new Map();
  const oyentes = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) {
      const { ok, mal } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? mal(new Error(m.error.message)) : ok(m.result);
    } else if (m.method && oyentes.has(m.method)) {
      oyentes.get(m.method)(m.params);
      oyentes.delete(m.method);
    }
  };
  return new Promise((listo, falla) => {
    ws.onerror = () => falla(new Error('no me pude conectar al navegador'));
    ws.onopen = () => listo({
      enviar: (method, params = {}) => new Promise((ok, mal) => {
        pendientes.set(++n, { ok, mal });
        ws.send(JSON.stringify({ id: n, method, params }));
      }),
      evento: (method) => new Promise((ok) => oyentes.set(method, ok)),
      cerrar: () => ws.close(),
    });
  });
}

const exe = NAVEGADORES.find(existsSync);
if (!exe) throw new Error('no encontré Chrome ni Edge');
const perfil = mkdtempSync(join(tmpdir(), 'cheque-'));
const nav = spawn(exe, ['--headless=new', '--hide-scrollbars', '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });

try {
  let pagina;
  for (let i = 0; i < 50 && !pagina; i++) {
    await esperar(200);
    try {
      const lista = await (await fetch('http://127.0.0.1:' + PUERTO + '/json/list')).json();
      pagina = lista.find((t) => t.type === 'page');
    } catch { /* todavía arrancando */ }
  }
  if (!pagina) throw new Error('el navegador no arrancó');

  const cdp = await conectar(pagina.webSocketDebuggerUrl);
  await cdp.enviar('Page.enable');
  // 96 px CSS por pulgada: con este factor, 1 mm de la página son 300 dpi en la captura
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 900, height: 1600, deviceScaleFactor: DPI / 96, mobile: false });
  const cargada = cdp.evento('Page.loadEventFired');
  await cdp.enviar('Page.navigate', { url: pathToFileURL(raiz + 'cheque.html').href });
  await cargada;

  const { result } = await cdp.enviar('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const css = document.createElement('style');
      css.textContent = 'body{background:#fff}.no-print,.pagina h2{display:none!important}.corte,.dorso{outline:none!important}';
      document.head.append(css);
      await document.fonts.ready;
      for (let i = 0; i < 50 && !document.querySelector('.ch-qr svg'); i++) await new Promise((r) => setTimeout(r, 100));
      await new Promise((r) => setTimeout(r, 300));
      return {
        qr: !!document.querySelector('.ch-qr svg'),
        rects: ${JSON.stringify(PIEZAS.map((p) => p.selector))}.map((s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
        }),
      };
    })()`,
  });
  if (!result.value.qr) throw new Error('no cargó el QR (¿sin internet?)');

  mkdirSync(salida, { recursive: true });
  for (const [i, pieza] of PIEZAS.entries()) {
    const clip = { ...result.value.rects[i], scale: 1 };
    const { data } = await cdp.enviar('Page.captureScreenshot', { format: 'webp', quality: 95, clip, captureBeyondViewport: true });
    writeFileSync(salida + pieza.archivo, Buffer.from(data, 'base64'));
    console.log(pieza.archivo + ' · ' + Math.round(clip.width * DPI / 96) + ' × ' + Math.round(clip.height * DPI / 96) + ' px');
  }
  cdp.cerrar();
} finally {
  nav.kill();
  await esperar(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* Chrome a veces tarda en soltar el perfil */ }
}
