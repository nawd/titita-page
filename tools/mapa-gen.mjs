// Genera js/mapa-data.js: grillas de caracteres precomputadas a partir de Natural Earth.
// Uso: node tools/mapa-gen.mjs   (descarga los datos la primera vez en tools/.cache/)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const cache = raiz + 'tools/.cache/';
const BASE = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/';

// cols = ancho de la grilla; las filas salen de la proyección (celdas cuadradas en Mercator)
const REGIONES = {
  sudamerica: { lonMin: -82, lonMax: -33, latMin: -56, latMax: 13, cols: 60 },
  patagonia: { lonMin: -73.2, lonMax: -69.8, latMin: -42.6, latMax: -39.6, cols: 60 },
};
const DIST_MAX = 9;
const SIMBOLOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

async function geojson(nombre) {
  const ruta = cache + nombre + '.geojson';
  if (!existsSync(ruta)) {
    mkdirSync(cache, { recursive: true });
    console.log('descargando ' + nombre + '…');
    const res = await fetch(BASE + nombre + '.geojson');
    if (!res.ok) throw new Error('no pude descargar ' + nombre);
    writeFileSync(ruta, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

const rad = (g) => (g * Math.PI) / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
const latDeY = (y) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * (180 / Math.PI);

// Polígonos como listas de anillos con su bbox, para point-in-polygon rápido
function poligonos(feature) {
  const g = feature.geometry;
  if (!g) return [];
  const lista = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return lista.map((anillos) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of anillos[0]) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    return { anillos, bbox: [x0, y0, x1, y1] };
  });
}

function dentro(p, lon, lat) {
  const [x0, y0, x1, y1] = p.bbox;
  if (lon < x0 || lon > x1 || lat < y0 || lat > y1) return false;
  let adentro = false;
  for (const anillo of p.anillos) {
    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      const [xi, yi] = anillo[i];
      const [xj, yj] = anillo[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) adentro = !adentro;
    }
  }
  return adentro;
}

function generar(region, paises, lagos) {
  const { lonMin, lonMax, latMin, latMax, cols } = region;
  const yMax = mercY(latMax);
  const yMin = mercY(latMin);
  const celda = rad(lonMax - lonMin) / cols;
  const rows = Math.round((yMax - yMin) / celda);
  const enRegion = (p) => !(p.bbox[2] < lonMin || p.bbox[0] > lonMax || p.bbox[3] < latMin || p.bbox[1] > latMax);
  const ps = paises.map((f) => ({ id: f.id, polys: f.polys.filter(enRegion) })).filter((f) => f.polys.length);
  const ls = lagos.flatMap((f) => f.polys.filter(enRegion));

  const simbolo = {};
  const leyenda = {};
  const tierra = []; // id de país o null por celda
  const lago = [];
  for (let r = 0; r < rows; r++) {
    const lat = latDeY(yMax - (r + 0.5) * celda);
    for (let c = 0; c < cols; c++) {
      const lon = lonMin + ((c + 0.5) / cols) * (lonMax - lonMin);
      const i = r * cols + c;
      lago[i] = ls.some((p) => dentro(p, lon, lat));
      const pais = lago[i] ? null : ps.find((f) => f.polys.some((p) => dentro(p, lon, lat)));
      tierra[i] = pais ? pais.id : null;
      if (pais && !simbolo[pais.id]) {
        const s = SIMBOLOS[Object.keys(simbolo).length];
        simbolo[pais.id] = s;
        leyenda[s] = pais.id;
      }
    }
  }

  // Distancia a la costa (BFS en 8 direcciones) para el degradé del mar
  const dist = new Array(rows * cols).fill(Infinity);
  const cola = [];
  tierra.forEach((t, i) => { if (t) { dist[i] = 0; cola.push(i); } });
  for (let k = 0; k < cola.length; k++) {
    const i = cola[k];
    const r = Math.floor(i / cols), c = i % cols;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
      const j = rr * cols + cc;
      if (dist[j] > dist[i] + 1) { dist[j] = dist[i] + 1; cola.push(j); }
    }
  }

  // Fila de texto: símbolo de país, '-' frontera (hueco), '~' lago, '1'..'9' mar por distancia
  const filas = [];
  for (let r = 0; r < rows; r++) {
    let fila = '';
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const t = tierra[i];
      if (t) {
        const der = c + 1 < cols ? tierra[i + 1] : null;
        const abajo = r + 1 < rows ? tierra[i + cols] : null;
        fila += (der && der !== t) || (abajo && abajo !== t) ? '-' : simbolo[t];
      } else if (lago[i]) {
        fila += '~';
      } else {
        fila += String(Math.min(DIST_MAX, dist[i] === Infinity ? DIST_MAX : dist[i]));
      }
    }
    filas.push(fila);
  }
  return { lonMin, lonMax, latMin, latMax, cols, rows, paises: leyenda, filas };
}

const [paisesGeo, lagosGeo] = await Promise.all([geojson('ne_50m_admin_0_countries'), geojson('ne_10m_lakes')]);
const paises = paisesGeo.features.map((f) => {
  const p = f.properties;
  const id = p.ISO_N3 && p.ISO_N3 !== '-99' ? p.ISO_N3 : p.ADM0_A3;
  return { id, polys: poligonos(f) };
});
const lagos = lagosGeo.features.map((f) => ({ polys: poligonos(f) }));

const salida = {};
for (const [nombre, region] of Object.entries(REGIONES)) {
  salida[nombre] = generar(region, paises, lagos);
  console.log(nombre + ': ' + salida[nombre].cols + '×' + salida[nombre].rows);
}

writeFileSync(
  raiz + 'js/mapa-data.js',
  '// Generado por tools/mapa-gen.mjs a partir de Natural Earth (dominio público). No editar a mano.\n' +
    'globalThis.PP_MAPA = ' + JSON.stringify(salida, null, 1) + ';\n'
);
console.log('listo: js/mapa-data.js');
