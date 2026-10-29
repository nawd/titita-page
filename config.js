// ============================================================================
//  CONFIG DEL PASAPORTE — todo el contenido editable vive acá.
//  Lo marcado con [CORCHETES] es placeholder: reemplazalo por lo tuyo.
//  Respuestas, monto y mensaje final están en texto plano: editalos directo acá.
// ============================================================================
globalThis.CONFIG = {
  // Cambiá la versión si querés que el progreso guardado se reinicie para todos.
  version: 'v5',

  // URL pública (GitHub Pages). El QR del cheque apunta acá.
  siteUrl: 'https://nawd.github.io/titita-page/',

  nombre: 'Titita',
  autor: 'Bombón',
  agencia: 'Turismo Bombón',

  // Fecha de ustedes: se usa como n° de cheque y fecha de expedición.
  fecha: '14/02/2022', // [NUESTRA FECHA]
  numeroCheque: '14022022', // [NUESTRA FECHA SIN BARRAS]

  // Postal 3D de la portada: frente con foto y letras gordas, dorso con el mensaje.
  portada: {
    saludo: 'Saludos desde',
    titulo: 'Turismo Bombón', // letras gordas del frente
    fondo: 'assets/img/fotos_nuestras/lago_lacar_arriba_cerro_colorado_marzo_2024.webp',
    letras: 'assets/img/fotos_nuestras/Colón_febrero_2023_isla_san_francisco.webp', // foto que rellena las letras
    mensaje:
      'Titita: te mando esta postal desde todos los lugares a los que fuimos… y a los que vamos a ir. ' +
      'El viaje empieza ahora. — Bombón',
    para: 'Titita',
    direccion: ['Donde estemos juntos', 'Sudamérica (por ahora)'],
    ayuda: 'Tocá la postal para darla vuelta',
    boton: 'Empezar el viaje ✈️',
  },

  titular: {
    foto: 'assets/img/viajes/titular.jpg',
    nacionalidad: 'De acá y de donde estemos juntos',
    profesion: 'Buscadora oficial de pistas',
    bienvenida:
      'Este pasaporte habilita a su titular a viajar sin fecha de regreso. Para cobrar el cheque de viajero, ' +
      'la agencia pide un sello por cada destino del mapa. Los empleados de la agencia son ' +
      'pocos, románticos y bastante exigentes.',
  },

  mapa: {
    intro:
      'Tocá un destino para empezar. Podés ir en el orden que quieras: acá nadie te apura, ' +
      'salvo la valija. Mirá todo con atención, que esta agencia esconde cosas.',
    // Caracteres con los que se dibuja la tierra (se repiten en loop).
    textoTierra: 'viajar con vos es mi lugar favorito · Te amo Titita, por Bombón · ',
    leyenda: { visitado: 'Ya fuimos', otro: 'Nos falta', mar: 'Mar' },
    // Países "visitados" (códigos ISO numéricos de Natural Earth): Argentina y Brasil.
    visitados: ['032', '076'],
    // Polaroids de nuestros viajes. Aparecen (pegándose) recién cuando están sellados los
    // desafíos de `tras` (o de `recuerdosTras`): si no, darían las fechas del desafío de ordenar.
    // dx/dy corren la polaroid desde el lugar (en % del ancho/alto del mapa); rot la gira.
    recuerdosTras: ['destino-3'],
    recuerdos: [
      { lugar: 'Colón', fecha: 'feb 2023', lat: -32.22, lon: -58.14, dx: 21, dy: 3, rot: 5,
        foto: 'assets/img/viajes/mini/colon.jpg', grande: 'assets/img/fotos_nuestras/Colón_febrero_2023_isla_san_francisco.webp',
        nota: 'Isla San Francisco. Sí, el viaje de la lancha 🥴' },
      { lugar: 'Mendoza', fecha: 'may 2023', lat: -33.04, lon: -68.88, dx: -18, dy: -7, rot: -6,
        foto: 'assets/img/viajes/mini/mendoza.jpg', grande: 'assets/img/fotos_nuestras/mendoza_mayo_2023.webp',
        nota: 'Luján de Cuyo, 9 de la mañana, ni un auto en la calle: multa por una vuelta en U. Vos, mirando todo desde la ventana.' },
      { lugar: 'Bariloche', fecha: 'ago 2023', lat: -41.13, lon: -71.31, dx: 20, dy: 3, rot: 6,
        foto: 'assets/img/viajes/mini/bariloche-2023.jpg', grande: 'assets/img/fotos_nuestras/bariloche_cerro_catedral_agosto_2023.webp',
        nota: 'Cerro Catedral: el guiso que nos devolvió el alma al cuerpo.' },
      { lugar: 'San Martín', fecha: 'mar 2024', lat: -40.16, lon: -71.35, dx: -14, dy: -6, rot: 4,
        foto: 'assets/img/viajes/mini/san-martin.jpg', grande: 'assets/img/fotos_nuestras/lago_lacar_arriba_cerro_colorado_marzo_2024.webp',
        nota: 'El lago Lácar desde arriba del Cerro Colorado.' },
      { lugar: 'V. La Angostura', fecha: 'mar 2024', lat: -40.76, lon: -71.65, dx: -13, dy: 7, rot: -5,
        foto: 'assets/img/viajes/mini/villa-la-angostura.jpg', grande: 'assets/img/fotos_nuestras/villa_langostura.webp',
        nota: 'Villa La Angostura, desde el auto.' },
      { lugar: 'Tucumán', fecha: 'jun 2024', lat: -26.47, lon: -66.03, dx: -24, dy: -10, rot: 3, tras: ['destino-3', 'destino-1'],
        foto: 'assets/img/viajes/mini/quilmes.jpg', grande: 'assets/img/fotos_nuestras/ruina_quilmes_tucuman_junio_2024.webp',
        nota: 'Ruinas de Quilmes, entre cardones.' },
      { lugar: 'Río', fecha: 'ene 2025', lat: -22.97, lon: -43.18, dx: 9, dy: 10, rot: -4, tras: ['destino-3', 'destino-1'],
        foto: 'assets/img/viajes/mini/rio.jpg', grande: 'assets/img/fotos_nuestras/rio_enero_2025_haciendo_stand_up_paddle.webp',
        nota: 'Stand up paddle al atardecer.' },
      { lugar: 'Maceió', fecha: 'mar 2026', lat: -9.86, lon: -35.94, dx: -4, dy: -14, rot: 6,
        foto: 'assets/img/viajes/mini/maceio.jpg', grande: 'assets/img/fotos_nuestras/brasil_maceio_marzo_2026.webp',
        nota: 'Praia do Gunga (y los cuatriciclos).' },
      { lugar: 'Bariloche', fecha: 'ago 2026', lat: -41.16, lon: -71.4, dx: 18, dy: 16, rot: -7,
        foto: 'assets/img/viajes/mini/bariloche-2026.jpg', grande: 'assets/img/fotos_nuestras/Bari_cerro_catedral_agos_2026_primera_vez_Tita_arriba_todo.webp',
        nota: 'Cerro Catedral con tu cuñado: la primera vez que llegaste arriba de todo.' },
    ],
  },

  limiteErrores: 6,

  mensajesError: [
    'Mmm, no. La agencia te mira raro.',
    'Casi. Bueno, no tan casi.',
    'Ese no es. ¿Seguro que viniste conmigo?',
    'Respuesta rechazada por el departamento de recuerdos.',
    'Error 404: recuerdo no encontrado.',
    'Nop. Pero te queda lindo intentar.',
    'El guía está llorando de la risa.',
  ],

  falsaDerrota: {
    titulo: 'CHEQUE RECHAZADO ❌',
    subtitulo: 'Fondos insuficientes de memoria',
    giro: 'Mentira, seguí 💛',
    boton: 'Seguir',
    segundos: 4,
  },

  // Pista escondida: estas letras aparecen en un color apenas distinto dentro de los
  // textos listados (en orden). Mantener apretado el logo de la agencia las resalta.
  pistaOculta: {
    palabra: 'FIRMA',
    textos: ['titular.bienvenida', 'mapa.intro'],
  },

  desafios: [
    {
      id: 'destino-1',
      // Tarjeta del mapa cuando el destino está sellado (foto: null = "foto pendiente").
      // dx/dy la corren (en % del mapa) para que no se pise con las de al lado.
      tarjeta: { foto: 'assets/img/viajes/mini/rio.jpg', lugar: 'Río de Janeiro', fecha: 'Enero 2025', emociones: 'Paz y asombro 🌅' },
      tipo: 'blur',
      destino: 'Río de Janeiro', // se ve recién al sellar
      pais: 'Brasil',
      lat: -22.9,
      lon: -43.2,
      enunciado: '¿Dónde estamos? Son tres fotos y cada una se va aclarando con cada intento fallido (la agencia es generosa, no tonta).',
      // Una ronda por foto. imagenes: de más borrosa a nítida (generalas con tools/blur.html).
      // Respuestas válidas: se comparan sin mayúsculas, tildes ni puntuación.
      rondas: [
        {
          imagenes: ['assets/img/viajes/traful-blur-3.jpg', 'assets/img/viajes/traful-blur-2.jpg', 'assets/img/viajes/traful-blur-1.jpg', 'assets/img/viajes/traful-nitida.jpg'],
          pie: 'Río Traful, Neuquén · mar 2024',
          respuestas: ['Río Traful', 'Traful', 'Villa Traful', 'Río Limay', 'Limay'],
          pistas: ['Mate, termo y una playita de arena en la Patagonia.', 'Fue en el viaje de San Martín de los Andes. Es un río.'],
        },
        {
          imagenes: ['assets/img/viajes/quilmes-blur-3.jpg', 'assets/img/viajes/quilmes-blur-2.jpg', 'assets/img/viajes/quilmes-blur-1.jpg', 'assets/img/viajes/quilmes-nitida.jpg'],
          pie: 'Ruinas de Quilmes, Tucumán · jun 2024',
          respuestas: ['Ruinas de Quilmes', 'Quilmes', 'Ruinas', 'Tucumán', 'Amaicha'],
          pistas: ['Cardones gigantes y piedras con mucha historia.', 'Se llama igual que una cerveza 🍺'],
        },
        {
          imagenes: ['assets/img/viajes/rio-blur-3.jpg', 'assets/img/viajes/rio-blur-2.jpg', 'assets/img/viajes/rio-blur-1.jpg', 'assets/img/viajes/rio-nitida.jpg'],
          pie: 'Río de Janeiro · ene 2025',
          respuestas: ['Río de Janeiro', 'Rio', 'Rio Janeiro', 'Janeiro'],
          pistas: ['Stand up paddle al atardecer, en otro país.', 'Empieza con R y tiene carnaval.'],
        },
      ],
      recompensa: { texto: 'Tres de tres. Ese atardecer arriba de la tabla no me lo olvido más.' },
    },
    {
      id: 'destino-2',
      tarjeta: { foto: 'assets/img/viajes/mini/kona.jpg', lugar: 'Bar Kona, R. Mejía', fecha: 'Agosto 2025', emociones: 'Ternura y risas 🍸', dx: -8 },
      tipo: 'memotest',
      destino: 'Buenos Aires',
      pais: 'Argentina',
      lat: -34.9,
      lon: -58.6,
      enunciado: 'Encontrá los 6 pares de fotos. Cuando termines, la agencia te va a dictar una palabra clave.',
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
      tarjeta: { foto: null, lugar: 'Mar del Plata', fecha: 'Enero 2023', emociones: 'El primero de todos 💛', dx: 4, dy: 3 },
      tipo: 'order',
      destino: 'Mar del Plata',
      pais: 'Argentina',
      lat: -38.0,
      lon: -57.55,
      enunciado: 'Ordená los sellos de nuestros viajes del más viejo (arriba) al más nuevo (abajo). Arrastralos o usá las flechitas.',
      // ids + nombre visible. Opcional: imagen (sin fotos que spoileen la foto borrosa). El orden acá NO importa.
      // Para sumar un viaje: agregalo acá y poné su id en ordenCorrecto.
      sellos: [
        { id: 'mdq', nombre: 'Mar del Plata', anio: '' },
        { id: 'colon', nombre: 'Colón', anio: '', imagen: 'assets/img/viajes/mini/colon.jpg' },
        { id: 'mendoza', nombre: 'Mendoza', anio: '', imagen: 'assets/img/viajes/mini/mendoza.jpg' },
        { id: 'bariloche-2023', nombre: 'Bariloche · el guiso', anio: '', imagen: 'assets/img/viajes/mini/bariloche-2023.jpg' },
        { id: 'san-martin', nombre: 'San Martín de los Andes', anio: '', imagen: 'assets/img/viajes/mini/san-martin.jpg' },
        { id: 'tucuman', nombre: 'Tucumán', anio: '' },
        { id: 'rio', nombre: 'Río de Janeiro', anio: '' },
        { id: 'maceio', nombre: 'Maceió', anio: '', imagen: 'assets/img/viajes/mini/maceio.jpg' },
        { id: 'bariloche-2026', nombre: 'Bariloche · con el cuñado', anio: '', imagen: 'assets/img/viajes/mini/bariloche-2026.jpg' },
      ],
      pistas: [
        'El primero fue de playa, pero de este lado del charco.',
        'Bariloche abre y cierra la lista: una en 2023 y otra con nieve hasta arriba.',
      ],
      // Orden correcto (del más viejo al más nuevo), con los ids de arriba.
      ordenCorrecto: ['mdq', 'colon', 'mendoza', 'bariloche-2023', 'san-martin', 'tucuman', 'rio', 'maceio', 'bariloche-2026'],
      recompensa: { texto: 'Nueve viajes en orden. Volvé al mapa: se llenó de recuerdos 📸' },
    },
    {
      id: 'colon',
      tarjeta: { foto: 'assets/img/viajes/mini/colon.jpg', lugar: 'Colón, Entre Ríos', fecha: 'Febrero 2023', emociones: 'Risas y mareo 🥴', dx: 3, dy: -4 },
      tipo: 'lancha',
      destino: 'Colón',
      pais: 'Argentina',
      // Corrido un poquito al norte para que el pin no se pise con el de Buenos Aires.
      lat: -31.2,
      lon: -57.9,
      enunciado: 'Colón, Entre Ríos. Alguien tomó de más y no se puede bajar de la lancha 🥴. Tocá «¡Saltá!» justo cuando la lancha quede pareja con el muelle.',
      // Un salto por cada etapa hasta tierra firme.
      etapas: ['Al borde de la lancha', 'Un pie en el muelle', '¡Tierra firme!'],
      // Qué tan cerca del muelle tiene que estar (0 a 1: más grande = más fácil).
      tolerancia: 0.18,
      mensajesSplash: [
        '¡Splash! Saludos al río Uruguay.',
        'Casi. El muelle se movió (el muelle, claro).',
        'Ese salto fue más de fe que de puntería.',
        'El marinero te pide, por favor, que lo intentes de nuevo.',
      ],
      pistas: [
        'No es el muelle el que se mueve 🍷. Esperá a que la lancha quede derechita.',
        'Mirá la rayita dorada: cuando la lancha la toca, saltá.',
      ],
      recompensa: {
        imagen: 'assets/img/fotos_nuestras/Colón_febrero_2023_isla_san_francisco.webp',
        texto: 'Isla San Francisco, febrero 2023. Bajaste de la lancha, y esta vez sin que nadie te tenga que bajar a upa.',
      },
    },
    {
      id: 'san-martin',
      tarjeta: { foto: 'assets/img/viajes/mini/san-martin.jpg', lugar: 'Cerro Colorado', fecha: 'Marzo 2024', emociones: 'Vértigo y orgullo ⛰️' },
      tipo: 'cerro',
      destino: 'San Martín de los Andes',
      pais: 'Argentina',
      lat: -40.16,
      lon: -71.35,
      cerro: 'Cerro Colorado',
      enunciado: 'Subimos el Cerro Colorado. Cada respuesta correcta te sube un tramo; cada error, resbalón. ¡A la cumbre!',
      // correcta = posición de la opción correcta (0 = la primera). Las opciones se mezclan solas.
      preguntas: [
        { pregunta: '¿Qué lago se veía desde arriba del cerro?', opciones: ['El Lácar', 'El Nahuel Huapi', 'El Traful'], correcta: 0 },
        { pregunta: '¿Dónde nos hospedamos ese viaje?', opciones: ['San Martín de los Andes', 'Villa La Angostura', 'Bariloche'], correcta: 0 },
        { pregunta: '¿Qué más recorrimos en ese viaje?', opciones: ['Villa La Angostura y Bariloche', 'El Bolsón y Esquel', 'Mendoza y San Juan'], correcta: 0 },
      ],
      pistas: ['El cerro no está en Bariloche: es el de la ciudad donde dormíamos.', 'Desde arriba se ve un lago que empieza con L.'],
      recompensa: {
        imagen: 'assets/img/fotos_nuestras/lago_lacar_arriba_cerro_colorado_marzo_2024.webp',
        texto: 'Cumbre del Cerro Colorado. Vos mirando el Lácar; yo, a vos 💓💓',
      },
    },
    {
      id: 'mendoza',
      tarjeta: { foto: 'assets/img/viajes/mini/mendoza-barro.jpg', lugar: 'Termas de Cacheuta', fecha: 'Mayo 2023', emociones: 'Risas y barro 😂' },
      tipo: 'barro',
      destino: 'Mendoza',
      pais: 'Argentina',
      lat: -32.89,
      lon: -68.83,
      enunciado: 'Mendoza: fiesta en Potrerillos, bodegas y las termas de Cacheuta, donde alguien terminó embarrado de pies a cabeza. Limpiá la foto con el dedo y contestá: ¿en qué bodega nos sellaron el historial de viajes?',
      foto: 'assets/img/fotos_nuestras/Mendoza_barro_mayo_2023_termas_cacheuta.webp',
      // Fracción de la foto que hay que limpiar para que aparezca la respuesta (0 a 1).
      limpieza: 0.6,
      pistas: ['No fue en Decero.', 'Tiene nombre de tano y su finca, nombre de cielo.'],
      respuestas: ['Luigi Bosca', 'Luigi', 'Bosca', 'Bodega Luigi Bosca', 'Finca El Paraíso', 'El Paraíso', 'Paraíso'],
      recompensa: {
        texto: 'Luigi Bosca, Finca El Paraíso: un sello en cada rincón de la bodega. Y en la cabaña de Potrerillos casi te comés ' +
          'los pellets de la estufa pensando que eran palitos salados (el humo que se armó…). Salud 🍷',
      },
    },
    {
      id: 'destino-4',
      tarjeta: { foto: 'assets/img/viajes/mini/gertrudis.jpg', lugar: 'Casa, con Gertrudis', fecha: 'Todos los días', emociones: 'Amor gatuno 🐱', dx: 4, dy: -3 },
      tipo: 'text',
      destino: 'El sobre',
      pais: 'Argentina',
      lat: -25.6,
      lon: -54.5,
      enunciado: 'La respuesta siempre estuvo en tus manos. ¿Cuál es la palabra?',
      pistas: [
        'Agarrá el cheque y mirálo de muuuy cerca.',
        'Hay cosas que te pueden ayudar 🔎',
      ],
      respuestas: ['Gertrudis', 'bernie', 'bernis'],
      recompensa: {
        imagen: 'assets/img/fotos_nuestras/gertrudis_desafio_7.webp',
        texto: 'Lo tuviste en la mano todo el tiempo. Como a mí.',
      },
    },
  ],

  final: {
    titulo: 'Tu próximo destino necesita una valija',
    verificando: 'Verificando sellos con el gerente de la agencia…',
    sello: 'APROBADO',
    monto: 250000,
    moneda: '$',
    mensaje: 'Te amorch Titita, sos muy especial para mi',
    guinoEtiqueta: '¿Ahora entendés la etiqueta del sobre? 🧳',
    boton: 'Ver el próximo destino',

    proximo: {
      titulo: 'Próxima parada: los lagos',
      texto: 'Febrero 2027: Bariloche, El Bolsón y Villa La Angostura. Una cabaña frente al lago, asado, y vos estrenando valija.',
      // Paradas en el orden en que se dibuja la ruta.
      ruta: [
        { nombre: 'El Bolsón', lat: -41.96, lon: -71.53 },
        { nombre: 'Bariloche', lat: -41.13, lon: -71.31 },
        { nombre: 'Villa La Angostura', lat: -40.76, lon: -71.65 },
      ],
      // Fotos que van pasando. pendiente: true muestra el rótulo "foto pendiente".
      galeria: [
        // La primera también va como polaroid adentro de la valija 3D.
        { src: 'assets/img/fotos_nuestras/Hotel_Bariloche_inacayal_agosto_2026.webp', pie: 'Bariloche: el lago desde la ventana' },
        { src: 'assets/img/fotos_nuestras/villa_langostura.webp', pie: 'Villa La Angostura' },
        { src: 'assets/img/fotos_nuestras/Bari_cerro_catedral_agos_2026_primera_vez_Tita_arriba_todo.webp', pie: 'Cerro Catedral, otra vez' },
        { src: 'assets/img/galeria/bolson.svg', pie: 'El Bolsón', pendiente: true },
        { src: 'assets/img/galeria/cabana.svg', pie: 'La cabaña frente al lago', pendiente: true },
        { src: 'assets/img/galeria/asado.svg', pie: 'Y el asado, obvio', pendiente: true },
      ],
      cierre: 'Armá la valija. Yo pongo el fuego. 🔥',
      // Opcional: una línea extra al final. null para ocultarla.
      algunDia: null, // ej: '…y algún día: Riviera Maya o San Andrés ✈️'
      // Opcional: la elección del viaje siguiente. Ella toca una opción y le cae el sello.
      eleccion: {
        titulo: 'Y para enero 2028…',
        texto: 'La agencia tiene dos propuestas y un empate técnico. Elegí vos:',
        opciones: [
          { lugar: 'Riviera Maya', pais: 'México', emoji: '🌮', voto: 'Bombón',
            mensaje: '¿Riviera Maya? Bombón ya está buscando pasajes 🌮' },
          { lugar: 'San Andrés', pais: 'Colombia', emoji: '🏝️', voto: 'Tita',
            mensaje: 'San Andrés: pedido registrado. La agencia lo negocia con Bombón 😏' },
        ],
      },
    },
  },

  cheque: {
    leyenda: 'Válido solo con todos los sellos del pasaporte',
    // Microtexto impreso en la línea de firma: la respuesta del desafío del sobre.
    microtexto: 'Gertrudis',
    dorso: 'Para la que me enseñó que el mejor destino es el que todavía no conocemos.',
    etiqueta: {
      frente: 'Equipaje de',
      dorsoTitulo: 'Destino',
      pie: 'Turismo Bombón — Depto. de Valijas',
    },
  },
};
