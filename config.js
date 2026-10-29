// ============================================================================
//  CONFIG DEL PASAPORTE — todo el contenido editable vive acá.
//  Lo marcado con [CORCHETES] es placeholder: reemplazalo por lo tuyo.
//  Respuestas, monto y mensaje final están en texto plano: editalos directo acá.
// ============================================================================
globalThis.CONFIG = {
  // Cambiá la versión si querés que el progreso guardado se reinicie para todos.
  version: 'v1',

  // URL pública (GitHub Pages). El QR del cheque apunta acá.
  siteUrl: 'https://nawd.github.io/titita-page/',

  nombre: 'Titita',
  autor: '[TU NOMBRE]',
  banco: 'Banco de Nosotros',

  // Fecha de ustedes: se usa como n° de cheque y fecha de expedición.
  fecha: '14/02/2022', // [NUESTRA FECHA]
  numeroCheque: '14022022', // [NUESTRA FECHA SIN BARRAS]

  portada: {
    titulo: 'Pasaporte',
    subtitulo: 'Expedido por el Banco de Nosotros',
    boton: 'Abrir pasaporte',
  },

  titular: {
    foto: 'assets/img/ejemplo/titular.svg', // [FOTO DE ELLA]
    nacionalidad: 'De acá y de donde estemos juntos',
    profesion: 'Buscadora oficial de pistas',
    bienvenida:
      'Este pasaporte habilita a su titular a viajar sin fecha de regreso. Para cobrar el cheque, ' +
      'el banco pide cuatro sellos: uno por cada destino del mapa. Los empleados del banco son ' +
      'pocos, románticos y bastante exigentes.',
  },

  mapa: {
    intro:
      'Tocá un destino para empezar. Podés ir en el orden que quieras: acá nadie te apura, ' +
      'salvo la valija. Mirá todo con atención, que este banco esconde cosas.',
    // Caracteres con los que se dibuja la tierra (se repiten en loop).
    textoTierra: 'viajar con vos es mi lugar favorito · ',
    leyenda: { visitado: 'Ya fuimos', otro: 'Nos falta', mar: 'Mar' },
    // Países "visitados" (códigos ISO numéricos de Natural Earth): Argentina y Brasil.
    visitados: ['032', '076'],
  },

  limiteErrores: 6,

  mensajesError: [
    'Mmm, no. El banco te mira raro.',
    'Casi. Bueno, no tan casi.',
    'Ese no es. ¿Seguro que viniste conmigo?',
    'Respuesta rechazada por el departamento de recuerdos.',
    'Error 404: recuerdo no encontrado.',
    'Nop. Pero te queda lindo intentar.',
    'El cajero está llorando de la risa.',
  ],

  falsaDerrota: {
    titulo: 'CHEQUE RECHAZADO ❌',
    subtitulo: 'Fondos insuficientes de memoria',
    giro: 'Mentira, seguí 💛',
    boton: 'Seguir',
    segundos: 4,
  },

  // Pista escondida: estas letras aparecen en un color apenas distinto dentro de los
  // textos listados (en orden). Mantener apretado el sello del banco las resalta.
  pistaOculta: {
    palabra: 'FIRMA',
    textos: ['titular.bienvenida', 'mapa.intro'],
  },

  desafios: [
    {
      id: 'destino-1',
      tipo: 'blur',
      destino: 'Río de Janeiro', // [NOMBRE DEL DESTINO] — se ve recién al sellar
      pais: 'Brasil',
      lat: -22.9,
      lon: -43.2,
      enunciado: '¿Dónde estamos? La foto se va aclarando con cada intento fallido (el banco es generoso, no tonto).',
      // De más borrosa a nítida. Generalas con tools/blur.html.
      imagenes: [
        'assets/img/ejemplo/rio-blur-3.svg',
        'assets/img/ejemplo/rio-blur-2.svg',
        'assets/img/ejemplo/rio-blur-1.svg',
        'assets/img/ejemplo/rio-nitida.svg',
      ],
      pistas: ['Hacía muchísimo calor y había un Cristo mirándonos.', 'Empieza con R y tiene carnaval.'],
      // Respuestas válidas: se comparan sin mayúsculas, tildes ni puntuación.
      respuestas: ['Río de Janeiro', 'Rio', 'Rio Janeiro', 'Janeiro'],
      recompensa: { texto: 'Todavía me acuerdo de tu cara cuando vimos el mar desde arriba. [TU RECUERDO]' },
    },
    {
      id: 'destino-2',
      tipo: 'memotest',
      destino: 'Buenos Aires',
      pais: 'Argentina',
      lat: -34.6,
      lon: -58.4,
      enunciado: 'Encontrá los 6 pares de fotos. Cuando termines, el banco te va a dictar una palabra clave.',
      cartas: [
        'assets/img/ejemplo/memo-1.svg',
        'assets/img/ejemplo/memo-2.svg',
        'assets/img/ejemplo/memo-3.svg',
        'assets/img/ejemplo/memo-4.svg',
        'assets/img/ejemplo/memo-5.svg',
        'assets/img/ejemplo/memo-6.svg',
      ],
      palabraClave: 'AVENTURA', // se muestra al completar el memotest
      sinFalsaDerrota: true,
      pistas: ['Las cartas no muerden: dalas vuelta sin miedo.', 'Tip de experta: arrancá por las esquinas.'],
      // La palabraClave ya vale como respuesta; acá podés sumar otras.
      respuestas: [],
      recompensa: { texto: 'Memoria de elefante y corazón de golondrina. Sello concedido.' },
    },
    {
      id: 'destino-3',
      tipo: 'order',
      destino: 'Córdoba',
      pais: 'Argentina',
      lat: -31.4,
      lon: -64.2,
      enunciado: 'Ordená los sellos de nuestros viajes del más viejo (arriba) al más nuevo (abajo). Arrastralos o usá las flechitas.',
      // ids + nombre visible. Opcional: imagen: 'assets/img/...'. El orden acá NO importa.
      sellos: [
        { id: 'mendoza', nombre: 'Mendoza', anio: '' },
        { id: 'rio', nombre: 'Río', anio: '' },
        { id: 'cordoba', nombre: 'Córdoba', anio: '' },
        { id: 'salta', nombre: 'Salta', anio: '' },
        { id: 'florianopolis', nombre: 'Florianópolis', anio: '' },
      ],
      pistas: ['El primero fue el que tuvo más sierras.', 'El último fue el más al norte de Argentina.'],
      // Orden correcto (del más viejo al más nuevo), con los ids de arriba.
      ordenCorrecto: ['cordoba', 'florianopolis', 'mendoza', 'rio', 'salta'],
      recompensa: { texto: 'Cinco viajes en orden y ni un ataque de nervios. Sos la mejor copiloto.' },
    },
    {
      id: 'destino-4',
      tipo: 'text',
      destino: 'El sobre',
      pais: 'Argentina',
      lat: -25.6,
      lon: -54.5,
      enunciado: 'La respuesta siempre estuvo en tus manos. ¿Cuál es la palabra?',
      pistas: [
        'Agarrá el cheque y mirálo de muuuy cerca.',
        'Hay letras tímidas en este pasaporte. Mantené apretado el sello del banco 👀',
      ],
      respuestas: ['Brujula', 'La brujula', 'Una brujula'],
      recompensa: { texto: 'Lo tuviste en la mano todo el tiempo. Como a mí.' },
    },
  ],

  final: {
    titulo: 'Tu próximo destino necesita una valija',
    verificando: 'Verificando sellos con el gerente…',
    sello: 'APROBADO',
    monto: 250000,
    moneda: '$',
    mensaje: 'Te amorch Titita, sos muy especial para mi',
    guinoEtiqueta: '¿Ahora entendés la etiqueta del sobre? 🧳',
    boton: 'Ver el próximo destino',

    proximo: {
      titulo: 'Próxima parada: los lagos',
      texto: 'Bariloche, Villa La Angostura, San Martín de los Andes y El Bolsón. Una cabaña frente al lago, asado, y vos estrenando valija.',
      // Paradas en el orden en que se dibuja la ruta.
      ruta: [
        { nombre: 'El Bolsón', lat: -41.96, lon: -71.53 },
        { nombre: 'Bariloche', lat: -41.13, lon: -71.31 },
        { nombre: 'Villa La Angostura', lat: -40.76, lon: -71.65 },
        { nombre: 'San Martín de los Andes', lat: -40.16, lon: -71.35 },
      ],
      // Fotos que van pasando. pendiente: true muestra el rótulo "foto pendiente".
      galeria: [
        { src: 'assets/img/galeria/bariloche.svg', pie: 'Bariloche', pendiente: true },
        { src: 'assets/img/galeria/angostura.svg', pie: 'Villa La Angostura', pendiente: true },
        { src: 'assets/img/galeria/san-martin.svg', pie: 'San Martín de los Andes', pendiente: true },
        { src: 'assets/img/galeria/bolson.svg', pie: 'El Bolsón', pendiente: true },
        { src: 'assets/img/galeria/cabana.svg', pie: 'La cabaña frente al lago', pendiente: true },
        { src: 'assets/img/galeria/asado.svg', pie: 'Y el asado, obvio', pendiente: true },
      ],
      cierre: 'Armá la valija. Yo pongo el fuego. 🔥',
      // Opcional: una línea extra al final. null para ocultarla.
      algunDia: null, // ej: '…y algún día: Riviera Maya o San Andrés ✈️'
    },
  },

  cheque: {
    leyenda: 'Válido solo con 4 sellos en el pasaporte',
    // Microtexto impreso en la línea de firma y en el borde: la respuesta del desafío 4.
    microtexto: 'BRUJULA',
    dorso: 'Para la que me enseñó que el mejor destino es el que todavía no conocemos.',
    etiqueta: {
      frente: 'Equipaje de',
      dorsoTitulo: 'Destino',
      pie: 'Banco de Nosotros — Depto. de Valijas',
    },
  },
};
