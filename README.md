# Pasaporte · Banco de Nosotros

Un regalo en forma de juego: un cheque impreso de un banco ficticio con un QR que lleva a un **pasaporte** web. Ella resuelve 4 destinos sobre un mapa de Sudamérica escrito con letras, junta 4 sellos, y el banco "aprueba" el cheque: aparece una **valija 3D** que se abre y de adentro sale el cheque, se revela el monto, aparece tu mensaje y el mapa vuela a los lagos del sur, con fotos del próximo viaje.

- HTML + CSS + JS vanilla, sin build. Funciona en GitHub Pages tal cual.
- La valija 3D usa Three.js desde CDN y se carga solo al final; si el celu no tiene WebGL, el final sigue en 2D.
- Todo el contenido vive en [`config.js`](config.js).
- Especificación completa: [`SPEC.md`](SPEC.md).

## Estructura

```
index.html          pasaporte (portada, mapa, desafíos, final)
cheque.html         cheque 20×8 cm + dorso + etiqueta de equipaje, para imprimir
config.js           TODO el contenido editable
css/                estilos del pasaporte, del cheque y de impresión
js/                 lógica (respuestas, mapa, desafíos, efectos, galería…)
assets/img/         fotos (ejemplo/ y galeria/ traen mocks para probar)
tools/blur.html     una foto → 4 versiones desenfocadas
tools/mapa-gen.mjs  regenera js/mapa-data.js desde Natural Earth
tests/run.mjs       tests (node tests/run.mjs)
```

## Probarlo ya, con el contenido de ejemplo

```bash
python -m http.server 8080
```

Abrí `http://localhost:8080`. Las respuestas de ejemplo son:

| Destino | Tipo | Respuesta de ejemplo |
|---|---|---|
| 1 · Río de Janeiro | foto borrosa | `rio de janeiro` (también `rio`, `janeiro`) |
| 2 · Buenos Aires | memotest | completar los pares y escribir `aventura` |
| 3 · Córdoba | ordenar | Córdoba → Florianópolis → Mendoza → Río → Salta |
| 4 · El sobre | texto | `brujula` (también `la brujula`) |

La pista oculta del ejemplo es la palabra **FIRMA** (letras apenas más violetas en los textos del titular y del mapa; mantené apretado el logo del banco para resaltarlas).

Para probarlo en el celu sin subir nada: con la compu y el celu en el mismo wifi, entrá desde el celu a `http://<IP de la compu>:8080` (la IP la ves con `ipconfig`).

## Cómo personalizar

Todo está en `config.js`. Lo que dice `[CORCHETES]` es placeholder.

1. **Datos generales:** `nombre`, `autor` (tu nombre, va en la firma), `fecha` y `numeroCheque` (la fecha de ustedes), `siteUrl` (la URL de Pages).
2. **Titular:** `titular.foto` (una foto de ella), nacionalidad, profesión y el texto de bienvenida.
3. **Desafíos:** cada uno tiene `destino`, `pais`, `lat`/`lon` (dónde va el pin), `enunciado`, 2 `pistas` (aparecen a los 2 y 4 errores), `recompensa` y sus `respuestas`: una lista en texto plano con todas las formas que aceptás. Se comparan sin mayúsculas, tildes, puntuación ni espacios de más, así que `'Río de Janeiro'` ya acepta `rio de janeiro!`. Por tipo:
   - `blur`: `imagenes` con las 4 versiones (usá `tools/blur.html`).
   - `memotest`: `cartas` con 6 fotos y `palabraClave` (ya vale como respuesta; `respuestas` es para sumar otras).
   - `order`: `sellos` con `id` y `nombre` (opcional `imagen` y `anio`) y `ordenCorrecto` con los `id` del más viejo al más nuevo. Los sellos se muestran mezclados.
   - `text`: solo `respuestas`.
4. **Pista oculta:** `pistaOculta.palabra` (ayuda para el desafío 4) y en qué textos se esconden sus letras. El test avisa si la palabra no entra en esos textos.
5. **Mensaje final:** `final.monto` (número, sin puntos), `final.moneda` y `final.mensaje` (tu frase). El resto de `final`: título, guiño a la etiqueta, ruta de los lagos, galería y cierre.
6. **Valija 3D:** usa sola los sellos de los 4 destinos, la primera foto de la galería (polaroid en la tapa) y el texto de `cheque.etiqueta` para la etiqueta que cuelga de la manija.
7. **Galería:** en `final.proximo.galeria` cambiá cada `src` por tus fotos (ponelas en `assets/img/galeria/`) y borrá `pendiente: true` para que se vaya el rótulo "📷 foto pendiente".
8. **Cheque:** `cheque.microtexto` es la respuesta del desafío 4 impresa en la línea de firma; también el texto del dorso y de la etiqueta.
9. **Mapa:** `mapa.textoTierra` es la frase con la que se "escribe" la tierra; `mapa.visitados` son los países en bordó (códigos ISO numéricos: Argentina `032`, Brasil `076`, Chile `152`, Uruguay `858`, Paraguay `600`).

Si cambiás respuestas o el contenido de los desafíos después de que ella empezó, subí `version` (por ej. `'v2'`) para que el progreso guardado se reinicie.

## Herramientas (`/tools`, uso local)

### `tools/blur.html` — fotos borrosas
1. Elegí la foto, poné un nombre base (ej. `destino1`) y tocá **Generar**.
2. Ajustá los % de desenfoque hasta que blur-1 todavía cueste.
3. **Descargar las 4** y copialas a `assets/img/`. Pegá el bloque `imagenes:` que te da.

### `tools/mapa-gen.mjs` — mapa
Solo si querés cambiar el encuadre: `node tools/mapa-gen.mjs` (descarga Natural Earth la primera vez en `tools/.cache/`).

## Subir a GitHub Pages

El repo es `https://github.com/nawd/titita-page`.

1. Subí los cambios:
   ```bash
   git add -A
   ```
   ```bash
   git commit -m "Pasaporte listo"
   ```
   ```bash
   git push origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
3. Esperá 1–2 minutos. La URL queda en `https://nawd.github.io/titita-page/` (la misma que `siteUrl` en el config).
4. Cada `git push` vuelve a publicar solo.

## Probarlo en el celular

1. Abrí `https://nawd.github.io/titita-page/` en el celu (o escaneá el QR de `cheque.html` desde la pantalla).
2. Jugá los 4 destinos: tocar, arrastrar los sellos, el memotest, el input con el teclado del celu.
3. Mantené apretado el logo del banco (arriba a la izquierda) para ver la pista oculta.
4. Al terminar, **reseteá**: 5 toques rápidos en el logo del banco → confirmar.

## Checklist antes de imprimir

- [ ] `config.js` sin `[CORCHETES]` (nombre, tu firma, fecha, recuerdos).
- [ ] Respuestas, `ordenCorrecto`, `final.monto` y `final.mensaje` puestos en `config.js`.
- [ ] `node tests/run.mjs` en verde (chequea que cada desafío acepte su respuesta y que el microtexto del cheque sea válido).
- [ ] Subido a GitHub Pages y abierto desde el celular.
- [ ] Recorrido completo en el celu: los 4 destinos, la falsa derrota, la valija 3D abriéndose, el cheque aprobado con el monto correcto, la galería.
- [ ] `cheque.html`: el microtexto de la firma es la respuesta del desafío 4.
- [ ] Imprimir el cheque (escala 100%, gráficos de fondo activados) y **escanear el QR impreso** con el celu.
- [ ] Imprimir la etiqueta en cartulina, recortar, doblar y ponerle hilo.
- [ ] **Resetear el progreso** en tu celu (5 toques en el logo) para no dejar sellos puestos si ella usa el mismo dispositivo.
- [ ] Sobre: cheque + etiqueta. 🧳

## Tests

```bash
node tests/run.mjs
```

Prueban la normalización, la validación de respuestas, las reglas del juego y que `config.js` sea coherente: cada desafío acepta su respuesta, el orden usa todos los sellos, el microtexto es la respuesta del desafío 4 y la pista oculta entra en los textos.
