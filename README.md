# Pasaporte · Turismo Bombón

Un regalo en forma de juego: un cheque de viajero impreso de una agencia de turismo ficticia (Turismo Bombón) con un QR que lleva a un **pasaporte** web. Ella resuelve 7 destinos sobre un mapa de Sudamérica escrito con letras, junta un sello por destino, y la agencia "aprueba" el cheque: aparece una **valija 3D** que se abre y de adentro sale el cheque, se revela el monto, aparece tu mensaje y el mapa vuela a los lagos del sur, con fotos del próximo viaje.

- HTML + CSS + JS vanilla, sin build. Funciona en GitHub Pages tal cual.
- La valija 3D usa Three.js desde CDN y se carga solo al final; si el celu no tiene WebGL, el final sigue en 2D.
- Todo el contenido vive en [`config.js`](config.js).
- Especificación completa: [`SPEC.md`](SPEC.md).

## Estructura

```
index.html          postal 3D de portada + pasaporte (mapa, desafíos, final)
cheque.html         cheque 20×8 cm + dorso + etiqueta de equipaje, para imprimir
config.js           TODO el contenido editable
css/                estilos del pasaporte, del cheque y de impresión
js/                 lógica (respuestas, mapa, desafíos, efectos, galería…)
assets/img/         fotos: fotos_nuestras/ (originales), viajes/ (borrosas y miniaturas), ejemplo/ y galeria/ (mocks)
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
| 1 · Río de Janeiro | foto borrosa, 3 rondas | `traful`, después `quilmes`, después `rio` |
| 2 · Buenos Aires | memotest | completar los pares y escribir `aventura` |
| 3 · Mar del Plata | ordenar | Mar del Plata → Colón → Mendoza → Bariloche (guiso) → San Martín → Tucumán → Río → Maceió → Bariloche (cuñado) |
| 4 · Colón | lancha | tocar «¡Saltá!» 3 veces cuando la lancha queda pareja con el muelle |
| 5 · San Martín de los Andes | cerro | El Lácar · San Martín de los Andes · Villa La Angostura y Bariloche |
| 6 · Mendoza | barro | limpiar la foto con el dedo y escribir `luigi bosca` (también `luigi`, `bosca`, `finca el paraiso`) |
| 7 · El sobre | texto | `gertrudis` (también `bernie`, `bernis`) |

La pista oculta del ejemplo es la palabra **FIRMA** (letras apenas más violetas en los textos del titular y del mapa; mantené apretado el logo de la agencia para resaltarlas).

Para probarlo en el celu sin subir nada: con la compu y el celu en el mismo wifi, entrá desde el celu a `http://<IP de la compu>:8080` (la IP la ves con `ipconfig`).

## Cómo personalizar

Todo está en `config.js`. Lo que dice `[CORCHETES]` es placeholder.

1. **Datos generales:** `nombre`, `autor` (tu nombre, va en la firma), `fecha` y `numeroCheque` (la fecha de ustedes), `siteUrl` (la URL de Pages).
2. **Titular:** `titular.foto` (una foto de ella), nacionalidad, profesión y el texto de bienvenida.
3. **Desafíos:** cada uno tiene `destino`, `pais`, `lat`/`lon` (dónde va el pin), `enunciado`, 2 `pistas` (aparecen a los 2 y 4 errores), `recompensa` y sus `respuestas`: una lista en texto plano con todas las formas que aceptás. Se comparan sin mayúsculas, tildes, puntuación ni espacios de más, así que `'Río de Janeiro'` ya acepta `rio de janeiro!`. Por tipo:
   - `blur`: `imagenes` con las 4 versiones (usá `tools/blur.html`). Para varias fotos seguidas, `rondas`: cada una con `imagenes`, `pie` (se ve al acertarla), `respuestas` y sus 2 `pistas`; los errores y las pistas cuentan por ronda.
   - `memotest`: `cartas` con 6 fotos y `palabraClave` (ya vale como respuesta; `respuestas` es para sumar otras).
   - `order`: `sellos` con `id` y `nombre` (opcional `imagen` y `anio`; ojo que `anio` se ve y una foto puede spoilear la foto borrosa) y `ordenCorrecto` con los `id` del más viejo al más nuevo. Los sellos se muestran mezclados. Para sumar un viaje, agregalo a `sellos` y poné su `id` en `ordenCorrecto`.
   - `lancha`: `etapas` (un salto por etapa), `tolerancia` (0 a 1, más grande = más fácil) y `mensajesSplash` para cuando se cae al agua. No lleva `respuestas`.
   - `cerro`: `cerro` (nombre) y `preguntas`, cada una con `pregunta`, `opciones` y `correcta` (posición de la correcta, 0 = la primera; en pantalla se mezclan). No lleva `respuestas`.
   - `barro`: `foto` (la que queda tapada de barro), `limpieza` (qué fracción hay que limpiar, 0 a 1) y `respuestas` para la pregunta del enunciado.
   - `text`: solo `respuestas`.
   - Los errores de `memotest`, `lancha` y `cerro` cuentan para las pistas pero no disparan la falsa derrota.
4. **Pista oculta:** `pistaOculta.palabra` (ayuda para el desafío del sobre) y en qué textos se esconden sus letras. El test avisa si la palabra no entra en esos textos.
5. **Mensaje final:** `final.monto` (número, sin puntos), `final.moneda` y `final.mensaje` (tu frase). El resto de `final`: título, guiño a la etiqueta, ruta de los lagos, galería, cierre y `proximo.eleccion` (las dos opciones para enero 2028: ella toca una y le cae el sello "ELEGIDO"; queda guardada en su celu).
6. **Postal 3D de la portada:** `portada` lleva el saludo y el título del frente (letras gordas rellenas con la foto `letras`, sobre la foto `fondo`), y el `mensaje`, `para` y `direccion` del dorso. Se ve solo la primera vez; para volver a verla, reseteá el progreso. Sin WebGL (o si Three.js no carga en 6 s) aparece la misma postal en 2D.
   **Valija 3D:** usa sola los sellos de todos los destinos (hasta 8), la primera foto de la galería (polaroid en la tapa) y el texto de `cheque.etiqueta` para la etiqueta que cuelga de la manija.
7. **Galería:** en `final.proximo.galeria` cambiá cada `src` por tus fotos (ponelas en `assets/img/galeria/`) y borrá `pendiente: true` para que se vaya el rótulo "📷 foto pendiente".
8. **Cheque:** `cheque.microtexto` es la respuesta del desafío del sobre impresa en la línea de firma; también el texto del dorso y de la etiqueta.
9. **Tarjetas de los destinos sellados:** cada desafío tiene `tarjeta` (`foto` miniatura cuadrada o `null` para "foto pendiente", `lugar`, `fecha`, `emociones`, y `dx`/`dy` para correrla si se pisa con otra). Cuando lo sella, el pin del mapa pasa a ser esa tarjeta con el sello encimado; se agranda al pasar el mouse o con el primer toque en el celu (el segundo toque entra al desafío).
10. **Recuerdos en el mapa:** `mapa.recuerdos` son las polaroids (`foto` miniatura cuadrada, `grande` para verla ampliada, `lugar`, `fecha`, `nota`, `lat`/`lon`, y `dx`/`dy`/`rot` para correrla y girarla). Aparecen recién cuando están sellados los desafíos de `recuerdosTras` (el de ordenar, porque las fechas lo resuelven) o de su propio `tras`.
11. **Mapa:** `mapa.textoTierra` es la frase con la que se "escribe" la tierra; `mapa.visitados` son los países en bordó (códigos ISO numéricos: Argentina `032`, Brasil `076`, Chile `152`, Uruguay `858`, Paraguay `600`).

Si cambiás respuestas o el contenido de los desafíos después de que ella empezó, subí `version` (por ej. `'v5'`) para que el progreso guardado se reinicie.

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
2. Jugá los 7 destinos: tocar, arrastrar los sellos, el memotest, la lancha, el cerro, frotar el barro, el input con el teclado del celu.
3. Mantené apretado el logo de la agencia (arriba a la izquierda) para ver la pista oculta.
4. Al terminar, **reseteá**: 5 toques rápidos en el logo de la agencia → confirmar.

## Checklist antes de imprimir

- [ ] `config.js` sin `[CORCHETES]` (nombre, tu firma, fecha, recuerdos).
- [ ] Respuestas, `ordenCorrecto` (y sus pistas), las preguntas del cerro, la foto del barro, `final.monto` y `final.mensaje` puestos en `config.js` (buscá `[EDITAR]`).
- [ ] `node tests/run.mjs` en verde (chequea que cada desafío acepte su respuesta y que el microtexto del cheque sea válido).
- [ ] Subido a GitHub Pages y abierto desde el celular.
- [ ] Recorrido completo en el celu: los 7 destinos, la falsa derrota, la valija 3D abriéndose, el cheque aprobado con el monto correcto, la galería.
- [ ] `cheque.html`: el microtexto de la firma es la respuesta del desafío del sobre.
- [ ] Imprimir el cheque (escala 100%, gráficos de fondo activados) y **escanear el QR impreso** con el celu.
- [ ] Imprimir la etiqueta en cartulina, recortar, doblar y ponerle hilo.
- [ ] **Resetear el progreso** en tu celu (5 toques en el logo) para no dejar sellos puestos si ella usa el mismo dispositivo.
- [ ] Sobre: cheque + etiqueta. 🧳

## Tests

```bash
node tests/run.mjs
```

Prueban la normalización, la validación de respuestas, las reglas del juego y que `config.js` sea coherente: cada desafío acepta su respuesta, el orden usa todos los sellos, cada tipo existe, las preguntas del cerro tienen su opción correcta, el microtexto es la respuesta del desafío del sobre y la pista oculta entra en los textos.
