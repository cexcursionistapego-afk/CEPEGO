// Configuración inicial de reservas y menús. Todo esto se puede cambiar después
// desde el panel de gestión (/admin → Ajustes); lo que se guarda allí tiene
// prioridad sobre estos valores.

export const DEFAULT_CONFIG = {
  version: 1,

  booking: {
    minParty: 1,
    maxParty: 6, // grupos mayores → eventos privados
    windowDays: 60, // con cuánta antelación se abre el libro
    minAdvanceMinutes: 120, // no se aceptan reservas web con menos de 2 h
    autoConfirm: true, // false → las reservas web entran como «pendientes»
    cancellationHours: 48,
    requireMenuChoice: false,
    waitlist: true,
  },

  // days: 0 = domingo … 6 = sábado
  services: [
    {
      id: 'comida',
      label: { va: 'Migdia', es: 'Mediodía', en: 'Lunch' },
      days: [3, 4, 5, 6, 0],
      slots: ['13:30', '13:45', '14:00', '14:15', '14:30'],
      slotCapacity: 8, // comensales que pueden llegar en un mismo turno
      capacity: 24, // comensales totales del servicio
      duration: 150, // minutos (para el calendario del cliente)
    },
    {
      id: 'cena',
      label: { va: 'Nit', es: 'Noche', en: 'Dinner' },
      days: [3, 4, 5, 6],
      slots: ['20:30', '20:45', '21:00', '21:15', '21:30'],
      slotCapacity: 8,
      capacity: 24,
      duration: 180,
    },
  ],

  // Avisos automáticos al cliente. Los SMS solo salen si Twilio está configurado.
  notifications: {
    emailReminder: true, // email recordatorio el día antes
    smsConfirm: true, // SMS al confirmar la reserva
    smsReminder: true, // SMS recordatorio el día antes
    smsCancel: false, // SMS al cancelar
  },

  // Cierres puntuales: { from, to, service: 'all' | id, note }
  closures: [],

  menus: [
    {
      id: 'origen',
      active: true,
      name: { va: 'Origen', es: 'Origen', en: 'Origen' },
      summary: {
        va: 'Nou passos. Un recorregut curt pel paisatge que ens envolta: l’horta, la muntanya i la llotja del matí.',
        es: 'Nueve tiempos. Un recorrido corto por el paisaje que nos rodea: la huerta, el monte y la lonja de la mañana.',
        en: 'Nine courses. A short walk through the landscape around us: the orchard, the hills and the morning fish market.',
      },
      price: 95,
      pairing: [
        { id: 'vino', name: { va: 'Maridatge de vins', es: 'Maridaje de vinos', en: 'Wine pairing' }, price: 55 },
        { id: 'sin', name: { va: 'Maridatge sense alcohol', es: 'Maridaje sin alcohol', en: 'Non-alcoholic pairing' }, price: 38 },
      ],
      courses: [
        { va: 'Oliva, ametla tendra i aigua de tomaca', es: 'Aceituna, almendra tierna y agua de tomate', en: 'Olive, tender almond and tomato water' },
        { va: 'Pa de blat antic, mantega torrada', es: 'Pan de trigo antiguo, mantequilla tostada', en: 'Heritage wheat bread, browned butter' },
        { va: 'Gamba roja, cítrics fermentats, fenoll', es: 'Gamba roja, cítricos fermentados, hinojo', en: 'Red prawn, fermented citrus, fennel' },
        { va: 'Carxofa, rovell curat i brou de pernil', es: 'Alcachofa, yema curada y caldo de jamón', en: 'Artichoke, cured yolk and ham broth' },
        { va: 'Arròs melós de galeres', es: 'Arroz meloso de galeras', en: 'Mantis shrimp rice' },
        { va: 'Moll, brou de les seues espines, safrà', es: 'Salmonete, caldo de sus espinas, azafrán', en: 'Red mullet, bone broth, saffron' },
        { va: 'Colomí madurat, cirera i remolatxa', es: 'Pichón madurado, cereza y remolacha', en: 'Aged pigeon, cherry and beetroot' },
        { va: 'Taronja, oli d’oliva, llet d’ovella', es: 'Naranja, aceite de oliva, leche de oveja', en: 'Orange, olive oil, sheep’s milk' },
        { va: 'Dolços menuts', es: 'Pequeños dulces', en: 'Petits fours' },
      ],
    },
    {
      id: 'umbral',
      active: true,
      name: { va: 'Umbral', es: 'Umbral', en: 'Umbral' },
      summary: {
        va: 'Catorze passos. El menú complet de la casa, pensat per a una vesprada o una nit sense presses.',
        es: 'Catorce tiempos. El menú completo de la casa, pensado para una tarde o una noche sin prisa.',
        en: 'Fourteen courses. The full menu of the house, for an unhurried afternoon or evening.',
      },
      price: 145,
      pairing: [
        { id: 'vino', name: { va: 'Maridatge de vins', es: 'Maridaje de vinos', en: 'Wine pairing' }, price: 85 },
        { id: 'sin', name: { va: 'Maridatge sense alcohol', es: 'Maridaje sin alcohol', en: 'Non-alcoholic pairing' }, price: 55 },
      ],
      courses: [
        { va: 'Ostra, poma verda i anet', es: 'Ostra, manzana verde y eneldo', en: 'Oyster, green apple and dill' },
        { va: 'Oliva, ametla tendra i aigua de tomaca', es: 'Aceituna, almendra tierna y agua de tomate', en: 'Olive, tender almond and tomato water' },
        { va: 'Garota, coliflor i avellana', es: 'Erizo, coliflor y avellana', en: 'Sea urchin, cauliflower and hazelnut' },
        { va: 'Pa de blat antic, mantega torrada', es: 'Pan de trigo antiguo, mantequilla tostada', en: 'Heritage wheat bread, browned butter' },
        { va: 'Gamba roja, cítrics fermentats, fenoll', es: 'Gamba roja, cítricos fermentados, hinojo', en: 'Red prawn, fermented citrus, fennel' },
        { va: 'Tomaca de penjar, figa i alfàbega', es: 'Tomate de colgar, higo y albahaca', en: 'Hanging tomato, fig and basil' },
        { va: 'Carxofa, rovell curat i brou de pernil', es: 'Alcachofa, yema curada y caldo de jamón', en: 'Artichoke, cured yolk and ham broth' },
        { va: 'Arròs melós de galeres', es: 'Arroz meloso de galeras', en: 'Mantis shrimp rice' },
        { va: 'Moll, brou de les seues espines, safrà', es: 'Salmonete, caldo de sus espinas, azafrán', en: 'Red mullet, bone broth, saffron' },
        { va: 'Colomí madurat, cirera i remolatxa', es: 'Pichón madurado, cereza y remolacha', en: 'Aged pigeon, cherry and beetroot' },
        { va: 'Formatge de cabra de la serra, mel de romer', es: 'Queso de cabra de la sierra, miel de romero', en: 'Mountain goat’s cheese, rosemary honey' },
        { va: 'Taronja, oli d’oliva, llet d’ovella', es: 'Naranja, aceite de oliva, leche de oveja', en: 'Orange, olive oil, sheep’s milk' },
        { va: 'Xocolate, garrofa i sal', es: 'Chocolate, algarroba y sal', en: 'Chocolate, carob and salt' },
        { va: 'Dolços menuts', es: 'Pequeños dulces', en: 'Petits fours' },
      ],
    },
  ],
};

export const OCCASIONS = ['cumpleanos', 'aniversario', 'negocios', 'celebracion', 'primera'];
export const DIETARY = ['vegetariano', 'sin-gluten', 'sin-lactosa', 'marisco', 'frutos-secos', 'embarazo'];

// Estados por los que pasa una reserva.
export const STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'no_show', 'cancelled'];
export const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'seated', 'completed']);
