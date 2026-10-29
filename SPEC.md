# Spec: "Pasaporte — Turismo Bombón" (antes "Banco de Nosotros")

## Context
Regalo para la novia del usuario: un sobre con un cheque impreso de un banco ficticio + una etiqueta de equipaje de cartón con su nombre (spoiler sutil de la valija). El cheque tiene un QR a una página en GitHub Pages (`https://nawd.github.io/titita-page/`) con forma de pasaporte: 4 destinos sobre un **mapa de puntos tipográfico** de Sudamérica; cada desafío resuelto estampa un sello. Con los 4 sellos se descifra el monto y el mensaje final ("Tu próximo destino necesita una valija"), y el mapa hace zoom a la Patagonia norte: el próximo viaje ya planeado (Bariloche → Villa La Angostura → San Martín de los Andes → El Bolsón, cabaña frente al lago y asado), con una galería de fotos que van pasando. Carpeta local vacía, sin git todavía; el repo remoto es `github.com/nawd/titita-page`.

Decisiones ya tomadas por el usuario: destinos en **orden libre**; respuesta del desafío 4 **en texto plano en config.js** (también hasheada para validar); **repo público** OK.

## Supuestos (corregir si alguno está mal)
1. Sin frameworks ni build. Todo `<script>` clásico con un namespace global (`window.PP`), **no ES modules**, para que `tools/*.html` y `cheque.html` funcionen con doble clic (file://).
2. WebCrypto exige contexto seguro: funciona en `file://`, `localhost` y GitHub Pages (https), **no** en `http://192.168.x.x`. Para probar en el celular: GitHub Pages directamente (el README lo explica).
3. Mapa: **Canvas 2D hecho a mano, sin Three.js ni Pretext**. Three.js (~600 KB) es para 3D y no lo necesitamos; Pretext resuelve el layout de párrafos que fluyen, y acá cada punto es un carácter en una grilla fija, así que alcanza con `fillText`. Resultado igual de vistoso y mucho más liviano.
4. Datos del mapa: se precomputan **una vez** con un script de Node (`tools/mapa-gen.mjs`) a partir de Natural Earth 1:50m/1:110m (dominio público, paquete `world-atlas` vía jsDelivr) y se guardan en `js/mapa-data.js` (grilla compacta). Descargar ese dataset una vez es parte del plan aprobado.
5. QR: `qrcode-generator@1.4.4` desde cdnjs, solo en `cheque.html` (~20 KB). Ningún otro CDN.
6. Fuentes (Google Fonts): **IM Fell English** (títulos, vintage) + **Special Elite** (datos tipo máquina de escribir) + **Courier Prime** (texto largo y caracteres del mapa, más legible).
7. Sonido de sello sintetizado con WebAudio (sin archivos), silenciado por defecto.
8. El contenido de ejemplo funciona de entrada con imágenes SVG placeholder y respuestas de ejemplo documentadas en el README. `[NOMBRE]` y demás datos quedan como placeholders claros en `config.js`.

## Objetivo y criterios de aceptación
- **Portada**: "Pasaporte de [NOMBRE] — Expedido por el Banco de Nosotros"; se abre con animación de tapa (fade si `prefers-reduced-motion`).
- **Mapa-índice** (pantalla principal):
  - Canvas con grilla de caracteres monoespaciados. Tierra = caracteres (letras/`·`/`•` configurables, tinta); **fronteras = huecos sin puntos** (celda vecina de otro país → se omite); mar = puntos, **celeste junto a la costa → azul tinta oscuro** al alejarse (interpolado por distancia a la costa precomputada).
  - Encuadre: Sudamérica. Países con tono propio: visitados (Argentina, Brasil) en bordó; vecinos (Chile, Uruguay, Paraguay, Bolivia, etc.) en tinta apagada. México/Colombia no van en el mapa; si se quiere, una línea de texto configurable `algunDia` ("…y algún día: Riviera Maya o San Andrés"), apagada por defecto.
  - 4 pines-destino (lat/lon en config) tocables; cada uno abre su desafío. Pin sellado = sello estampado sobre el mapa.
  - Indicador "Sellos n/4". Rinde a ≥45 fps en transiciones en un celular de gama media; el mapa estático se dibuja una sola vez en un canvas offscreen.
- **Desafíos** (tipo configurable, orden libre). Cada uno tiene destino, enunciado, tipo, respuestas, 2 pistas (tras 2 y 4 errores) y recompensa (foto o mensaje):
  1. `blur`: foto blur-3 → blur-2 → blur-1 con cada error (se queda en blur-1); nítida al acertar. Archivos ya desenfocados, sin filtro CSS.
  2. `memotest`: 12 cartas (6 pares), grilla 3×4 a 375 px. Al completarlo aparece la palabra clave a tipear. Los desaciertos de pares cuentan para pistas pero **no** disparan la falsa derrota.
  3. `order`: sellos (imagen + nombre) arrastrables con pointer events + botones ↑/↓ accesibles. "Validar" compara el orden; un orden incorrecto cuenta como error.
  4. `text`: "La respuesta siempre estuvo en tus manos" → microtexto del cheque.
- **Pista oculta extra**: letras sueltas de textos de la UI en un color apenas distinto que forman una palabra de ayuda para el desafío 4. Mantener apretado (600 ms) el sello del banco activa una "lupa de tinta" que las intensifica un instante, para que sea descubrible en el celular.
- **Errores**: mensajes divertidos rotativos (lista en config) + temblor del input. **Aciertos**: sello que cae con rebote + sonido opcional.
- **Falsa derrota**: al llegar a `limiteErrores` (default 6) en un desafío, aparece "CHEQUE RECHAZADO ❌ Fondos insuficientes de memoria"; a los 4 s cambia a "Mentira, seguí 💛" y sigue. Una vez por desafío.
- **Final**: el cheque aparece en pantalla, cae el sello "APROBADO", confeti a mano en canvas (reducido/estático con reduced-motion), se descifra y revela monto + mensaje del usuario, más un guiño configurable a la etiqueta ("¿Ahora entendés la etiqueta?").
- **Próximo destino (después del cheque)**: el mapa hace zoom a la Patagonia norte y una línea punteada recorre las paradas configurables (default: Bariloche → Villa La Angostura → San Martín de los Andes → El Bolsón), cada una con su pin-sello. Debajo, una **galería** que pasa sola (crossfade cada ~4 s, efecto Ken Burns suave; sin movimiento con reduced-motion), con swipe y puntos de navegación, pie de foto por imagen y un cierre configurable (ej. la cabaña frente al lago con asado). Mezcla fotos del lugar y fotos de ustedes de cuando estuvieron ahí; lista y textos en `config.final.galeria`.
- **Fotos pendientes**: hasta que el usuario las pase, la galería usa **mocks SVG** (paisaje de lago y montañas, cabaña, parrilla, ruta) con un rótulo "📷 foto pendiente — <lugar>", para ver el efecto ya funcionando. No se descargan fotos de terceros; se reemplazan por las del usuario cambiando rutas en config.
- **Progreso** en localStorage (todo con try/catch, la app funciona igual sin él), con clave namespaced por `config.version`. **Reset oculto**: 5 toques en el logo del banco en menos de 3 s → confirmación → borra.
- Tono: romántico con humor, sin cursilería. `<meta name="robots" content="noindex">`.

## Anti-trampa (liviano)
- `normalizar(s)`: minúsculas → NFD sin diacríticos → sin puntuación → espacios colapsados + trim.
- Cada respuesta válida se guarda como `{ h: sha256(normalizada) }`. Si un desafío tiene varias variantes, cada una también lleva `w`: la respuesta **canónica** cifrada con AES-GCM usando una clave PBKDF2 derivada de esa variante. Así cualquier variante correcta recupera la canónica sin que esté en texto plano.
- Canónicas: texto normalizado; `order` = ids en orden correcto unidos por `>`; memotest = palabra clave.
- **Final**: `{monto, mensaje}` en JSON, cifrado con AES-GCM; clave = PBKDF2-SHA256 (200k iteraciones, salt aleatorio) de las 4 canónicas concatenadas con `|` en orden de config. Las canónicas se guardan en el progreso para poder retomar.
- Excepciones aceptadas: la palabra del memotest y el microtexto del desafío 4 quedan en texto plano en config (hacen falta para mostrarse/imprimirse).

## Estructura de archivos
```
index.html            → pasaporte (portada, mapa, desafíos, final)
cheque.html           → cheque 20×8 cm + dorso + etiqueta de equipaje (impresión)
config.js             → TODO el contenido editable (window.CONFIG)
css/estilos.css       → tokens, papel, guilloché, sellos, animaciones, reduced-motion
css/impresion.css     → @page / @media print del cheque y la etiqueta
js/cripto.js          → normalizar, sha256, pbkdf2, aesGcm cifrar/descifrar (compartido con tools y tests)
js/progreso.js        → localStorage seguro + reset oculto
js/mapa.js            → render canvas del mapa de caracteres, pines, zoom final
js/mapa-data.js       → grilla precomputada (generada)
js/desafios.js        → blur, memotest, order, text
js/efectos.js         → sello, temblor, confeti, sonido WebAudio, falsa derrota
js/app.js             → arranque y navegación
assets/svg/           → guilloché, sellos, placeholders de ejemplo
assets/img/           → fotos reales (blur-1..3 + nítida, memotest, sellos, galeria/)
js/galeria.js         → slideshow del final (crossfade, swipe, autoplay)
tools/generar.html    → respuestas + mensaje final → bloque listo para pegar en config.js
tools/blur.html       → foto → descarga de blur-3/2/1/nítida (canvas, máx. 1080 px, JPEG 0.82)
tools/mapa-gen.mjs    → genera js/mapa-data.js desde Natural Earth
tests/run.mjs         → tests en Node de cripto, normalización, validación de orden
README.md, SPEC.md
```

## Cheque y etiqueta (`cheque.html`)
- Cheque 20×8 cm (`@page` + `@media print`): Banco de Nosotros, guilloché SVG, "Páguese a [NOMBRE]", "$ ????", n° = fecha configurable, línea de firma, "Válido solo con 4 sellos en el pasaporte", QR desde `config.siteUrl`, **microtexto** (~3.5 pt, repetido en la línea de firma y en el borde) con la respuesta del desafío 4.
- Dorso opcional en página aparte con mensaje corto y marcas de corte (duplex o pegado).
- **Etiqueta de equipaje** (~6×11 cm, cartulina): diseño **para doblar** (frente y dorso lado a lado en una misma cara, sin depender de la alineación duplex), con agujero marcado para hilo. Frente: "EQUIPAJE DE · [NOMBRE]"; dorso: "DESTINO: ________" + "Banco de Nosotros — Depto. de Valijas". Sin mencionar el regalo.
- Instrucciones en pantalla (ocultas al imprimir): escala 100%, gráficos de fondo activados, papel recomendado.

## Code style
```js
// js/cripto.js — script clásico, namespace global, funciones puras y async
(function (PP) {
  PP.normalizar = function (texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
  };
})(globalThis.PP = globalThis.PP || {});
```
Nombres en español, camelCase; CSS con variables en `:root` (`--tinta`, `--bordo`, `--papel`); sin dependencias salvo las nombradas.

## Comandos
- Tests: `node tests/run.mjs`
- Servidor local: `python -m http.server 8080` → `http://localhost:8080`
- Regenerar mapa: `node tools/mapa-gen.mjs`
- Deploy: `git init` → commit → `git remote add origin https://github.com/nawd/titita-page.git` → push a `main` → Settings ▸ Pages ▸ Deploy from branch `main` / root.

## Testing
- Unitarios (Node 24, sin dependencias): normalización (tildes, ñ, puntuación, espacios), SHA-256 contra vectores conocidos, ida y vuelta AES-GCM/PBKDF2, recuperación de canónica desde variantes, validación de orden, **el config de ejemplo descifra con las respuestas de ejemplo**.
- Manual en el panel del navegador a 375×812 y desktop: los 4 desafíos completos, pistas en 2/4 errores, falsa derrota, reset, reduced-motion, final completo, vista previa de impresión del cheque y la etiqueta.

## Límites
- Siempre: correr los tests antes de cada commit; todo el contenido en config.js; try/catch alrededor del storage.
- Preguntar antes: agregar cualquier dependencia nueva fuera de las nombradas; **hacer push al repo remoto o tocar la config de GitHub Pages** (por defecto dejo `git init` + commit local y vos hacés el push, o lo hago yo si me lo pedís).
- Nunca: commitear fotos reales que no hayas puesto vos; texto plano del monto en el repo.

## Plan de implementación (en orden)
1. `SPEC.md` (este documento) + `git init` + `.gitignore`.
2. `js/cripto.js` + `tests/run.mjs` (TDD) → `tools/generar.html` → generar el bloque de ejemplo para config.
3. `config.js` de ejemplo + `css/estilos.css` (tokens, papel, guilloché, sellos) + portada en `index.html`.
4. `tools/mapa-gen.mjs` → `js/mapa-data.js` → `js/mapa.js` (render, pines, zoom final). Checkpoint visual a 375 px.
5. `js/desafios.js` (blur, memotest, order, text) + `js/efectos.js` + `js/progreso.js` + `js/app.js`. Checkpoint: recorrido completo.
6. Final (cheque en pantalla, APROBADO, confeti, descifrado) + zoom a Patagonia con ruta de los lagos + galería con mocks SVG "foto pendiente".
7. `cheque.html` + `css/impresion.css` (cheque, dorso, etiqueta) + `tools/blur.html`.
8. `README.md` (personalizar, tools, GitHub Pages paso a paso, probar en celular, checklist antes de imprimir: probar QR, cada respuesta, resetear progreso).

## Verificación
- `node tests/run.mjs` en verde.
- `python -m http.server 8080` + panel del navegador: viewport mobile 375×812, recorrido completo con las respuestas de ejemplo, consola sin errores, reduced-motion emulado, reset con 5 toques.
- `cheque.html`: vista previa de impresión, medidas 20×8 cm, QR escaneable con la URL de config, microtexto presente.
- Post-deploy (lo hacés vos): abrir la URL de Pages en el celular, escanear el QR impreso.

## Cambios durante la implementación
- Confeti chico en cada sello y grande en el final (pedido del usuario). Frase final por defecto: "Te amorch Titita, sos muy especial para mi".
- Nombre de la titular: Titita.
- Ruta de los lagos en orden geográfico: El Bolsón → Bariloche → Villa La Angostura → San Martín de los Andes.
- Archivos extra: `js/logica.js` (reglas sin DOM, testeadas en Node), `js/graficos.js` (sellos, guilloché, escudo), `js/cheque.js` + `css/cheque.css` (cheque compartido entre el final y `cheque.html`).
- Sin `tests/index.html`: los tests de Node ya chequean que el `config.js` real acepte sus respuestas.
- El microtexto se dibuja en SVG (~3 pt) para que el navegador no le aplique tamaño mínimo de fuente al imprimir.
- Commits solo con el nombre del autor (sin co-autoría).
- **Valija 3D en el final** (pedido del usuario, prioridad celular): `js/valija3d.js` con Three.js 0.160 desde jsDelivr, cargado con `import()` solo al llegar al final (se precarga en segundo plano desde el 3er sello). La valija cae con rebote, saltan los cierres, se abre la tapa con luz cálida adentro y sale el cheque, que vuela hacia la pantalla y se convierte en el cheque HTML que recibe el sello APROBADO. Lleva los 4 sellos como calcos en la tapa, una polaroid de la primera foto de la galería en el forro y la etiqueta con su nombre colgando de la manija (dorso: "Destino · Los lagos"). Se puede girar con el dedo sin bloquear el scroll vertical. Mobile: canvas al ancho del contenedor, pixel ratio ≤ 2, sombras 1024 px, render pausado fuera de pantalla. Si no hay WebGL o Three.js tarda más de 9 s, el final sigue en 2D como antes. Con `prefers-reduced-motion` aparece directamente abierta.
- **Sin anti-trampa** (pedido del usuario: "nadie va a ver el repositorio"): se borraron `js/cripto.js` y `tools/generar.html`. Las respuestas, `ordenCorrecto`, `final.monto`, `final.moneda` y `final.mensaje` van en texto plano en `config.js`; la validación vive en `js/respuestas.js` (misma normalización). Reemplaza la sección "Anti-trampa" y el supuesto 2: sin WebCrypto, también se puede probar desde el celular por la red local (`http://192.168.x.x`).
- **Turismo Bombón y 7 destinos** (pedido del usuario):
  - La emisora pasa a ser una casa de turismo: `config.agencia = 'Turismo Bombón'` (antes `config.banco`). El cheque es un "cheque de viajero". Nada dice "4": el total sale de `config.desafios.length`.
  - Destinos (= número de pin): 1 Río (`blur`) · 2 Buenos Aires (`memotest`) · 3 Salta (`order`, 7 sellos: Colón, Río, Bariloche, Búzios, Mendoza, Tucumán, Salta; se pueden sumar más) · 4 Colón (`lancha`) · 5 Bariloche (`cerro`) · 6 Mendoza (`barro`) · 7 El sobre (`text`).
  - `lancha` (Colón, Entre Ríos): la lancha se bambolea; "¡Saltá!" cuando queda pareja con el muelle, 3 saltos. Errar = splash (cuenta para pistas, sin falsa derrota). Efecto de visión doble que se va pasando.
  - `cerro` (Bariloche, Cerro Colorado): preguntas de opción múltiple en `config`; cada acierto sube un tramo, cada error resbala uno.
  - `barro` (Mendoza, Termas de Cacheuta): limpiar con el dedo el barro que tapa una foto; limpia al 60% aparece la pregunta (bodega del historial de viajes: Luigi Bosca).
  - Los juegos sin input (`lancha`, `cerro`) sellan con `PP.JUEGO_COMPLETO`. Lógica pura nueva en `js/logica.js`: `vaivenLancha`, `enMuelle`, `tramoTras`, `fraccionLimpia`.
  - La valija 3D lleva un calco por destino (hasta 8).
