// ============================================================================
//  CONFIG DEL PASAPORTE — todo el contenido editable vive acá.
//  Lo marcado con [CORCHETES] es placeholder: reemplazalo por lo tuyo.
//  Respuestas, monto y mensaje final están en texto plano: editalos directo acá.
// ============================================================================
globalThis.CONFIG = {
  // Cambiá la versión si querés que el progreso guardado se reinicie para todos.
  version: 'v3',

  // URL pública (GitHub Pages). El QR del cheque apunta acá.
  siteUrl: 'https://nawd.github.io/titita-page/',

  nombre: 'Titita',
  autor: 'Bombón',
  agencia: 'Turismo Bombón',

  // Fecha de ustedes: se usa como n° de cheque y fecha de expedición.
  fecha: '14/02/2022', // [NUESTRA FECHA]
  numeroCheque: '14022022', // [NUESTRA FECHA SIN BARRAS]

  portada: {
    titulo: 'Pasaporte',
    subtitulo: 'Expedido por Turismo Bombón',
    boton: 'Abrir pasaporte',
  },

  titular: {
    foto: 'assets/img/ejemplo/titular.svg', // [FOTO DE ELLA]
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
    textoTierra: 'viajar con vos es mi lugar favorito · ',
    leyenda: { visitado: 'Ya fuimos', otro: 'Nos falta', mar: 'Mar' },
    // Países "visitados" (códigos ISO numéricos de Natural Earth): Argentina y Brasil.
    visitados: ['032', '076'],
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
      tipo: 'blur',
      destino: 'Río de Janeiro', // [NOMBRE DEL DESTINO] — se ve recién al sellar
      pais: 'Brasil',
      lat: -22.9,
      lon: -43.2,
      enunciado: '¿Dónde estamos? La foto se va aclarando con cada intento fallido (la agencia es generosa, no tonta).',
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
      tipo: 'order',
      destino: 'Salta',
      pais: 'Argentina',
      lat: -24.8,
      lon: -65.4,
      enunciado: 'Ordená los sellos de nuestros viajes del más viejo (arriba) al más nuevo (abajo). Arrastralos o usá las flechitas.',
      // ids + nombre visible. Opcional: imagen: 'assets/img/...'. El orden acá NO importa.
      // Para sumar un viaje: agregalo acá y poné su id en ordenCorrecto.
      sellos: [
        { id: 'colon', nombre: 'Colón', anio: '' },
        { id: 'rio', nombre: 'Río', anio: '' },
        { id: 'bariloche', nombre: 'Bariloche', anio: '' },
        { id: 'buzios', nombre: 'Búzios', anio: '' },
        { id: 'mendoza', nombre: 'Mendoza', anio: '' },
        { id: 'tucuman', nombre: 'Tucumán', anio: '' },
        { id: 'salta', nombre: 'Salta', anio: '' },
      ],
      pistas: [
        'El primero fue a orillas de un río, no del mar.', // [EDITAR PISTA]
        'Los dos de Brasil fueron uno atrás del otro.', // [EDITAR PISTA]
      ],
      // Orden correcto (del más viejo al más nuevo), con los ids de arriba. [EDITAR: orden real]
      ordenCorrecto: ['colon', 'rio', 'buzios', 'bariloche', 'mendoza', 'tucuman', 'salta'],
      recompensa: { texto: 'Siete viajes en orden y ni un ataque de nervios. Sos la mejor copiloto.' },
    },
    {
      id: 'colon',
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
      recompensa: { texto: 'Bajaste de la lancha. Esta vez sin que nadie te tenga que bajar a upa. [TU RECUERDO]' },
    },
    {
      id: 'bariloche',
      tipo: 'cerro',
      destino: 'Bariloche',
      pais: 'Argentina',
      lat: -41.13,
      lon: -71.31,
      cerro: 'Cerro Colorado',
      enunciado: 'Subimos el Cerro Colorado. Cada respuesta correcta te sube un tramo; cada error, resbalón. ¡A la cumbre!',
      // correcta = posición de la opción correcta (0 = la primera). Las opciones se mezclan solas.
      preguntas: [
        { pregunta: '¿Qué llevamos para la subida?', opciones: ['Mate y bizcochitos', 'Chocolate de Bariloche', 'Nada, éramos unos inconscientes'], correcta: 2 }, // [EDITAR]
        { pregunta: '¿Quién se cansó primero?', opciones: ['Vos', 'Yo', 'Los dos, pero nadie lo admitió'], correcta: 2 }, // [EDITAR]
        { pregunta: '¿Qué hicimos al llegar arriba?', opciones: ['La foto de la cumbre', 'Tirarnos al piso', 'Prometer que nunca más'], correcta: 0 }, // [EDITAR]
      ],
      pistas: ['En la montaña conviene ir despacio: leé bien cada opción.', 'Acordate de la cara que teníamos en la cumbre.'],
      recompensa: { texto: 'Cumbre. Con vos, hasta las subidas valen la pena. [TU RECUERDO]' },
    },
    {
      id: 'mendoza',
      tipo: 'barro',
      destino: 'Mendoza',
      pais: 'Argentina',
      lat: -32.89,
      lon: -68.83,
      enunciado: 'Termas de Cacheuta: alguien terminó embarrado de pies a cabeza. Limpiá la foto con el dedo y contestá: ¿en qué bodega nos hicieron completar el historial de viajes y nos sellaron el pasaporte?',
      foto: 'assets/img/ejemplo/barro.svg', // [FOTO DE BOMBÓN EMBARRADO]
      // Fracción de la foto que hay que limpiar para que aparezca la respuesta (0 a 1).
      limpieza: 0.6,
      pistas: ['No fue en Decero.', 'Tiene nombre de tano.'],
      respuestas: ['Luigi Bosca', 'Luigi', 'Bosca', 'Bodega Luigi Bosca'],
      recompensa: { texto: 'En Luigi Bosca nos sellaron el historial de viajes; ahora el sello te lo pongo yo. Salud 🍷' },
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
        'Hay cosas que te pueden ayudar 🔎',
      ],
      respuestas: ['Gertrudis', 'bernie', 'bernis'],
      recompensa: { texto: 'Lo tuviste en la mano todo el tiempo. Como a mí.' },
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
