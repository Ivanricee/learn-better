import type {
  Category,
  Temario,
  ThemeDetail,
  RoleplayScenario,
  RoleplayMessage,
  RoleplayEvaluation,
  TutorMessage,
  DiagnosticQuestion,
  GlobalProgress,
} from "./types";

// Categories for the home grid
export const categories: Category[] = [
  { id: 1, nombre: "Estrategia de Negocios", temas: 8, progreso: 78 },
  { id: 2, nombre: "IA Aplicada", temas: 12, progreso: 52 },
  { id: 3, nombre: "Derecho Fiscal", temas: 5, progreso: 18 },
  { id: 4, nombre: "Marketing Digital", temas: 6, progreso: 35 },
];

// Temario for category sidebar
export const temario: Temario = {
  zona1: [
    { id: "p1", nombre: "Fundamentos de contabilidad", estado: "pendiente" },
    { id: "p2", nombre: "Análisis financiero básico", estado: "pendiente" },
  ],
  zona2: [
    {
      id: "t1",
      nombre: "Estrategia competitiva",
      estado: "dominado",
      pendientes: 0,
    },
    {
      id: "t2",
      nombre: "Análisis de mercado",
      estado: "en_progreso",
      pendientes: 2,
    },
    { id: "t3", nombre: "Modelos de negocio", estado: "hueco", pendientes: 3 },
    {
      id: "t4",
      nombre: "Gestión de riesgo",
      estado: "pendiente",
      pendientes: 4,
    },
    {
      id: "t5",
      nombre: "Valuación de empresas",
      estado: "pendiente",
      pendientes: 4,
    },
  ],
  zona3: [
    { id: "s1", nombre: "M&A avanzado", estado: "pendiente" },
    { id: "s2", nombre: "Private equity", estado: "pendiente" },
    { id: "s3", nombre: "Estrategia global", estado: "pendiente" },
  ],
};

// Theme detail for central area
export const themeDetails: Record<string, ThemeDetail> = {
  t1: {
    tema: "Estrategia competitiva",
    estado: "dominado",
    resumen:
      "La estrategia competitiva se enfoca en cómo una empresa puede crear y mantener ventajas competitivas sostenibles. El material cubre los frameworks clásicos de Porter, incluyendo las cinco fuerzas competitivas y las estrategias genéricas de liderazgo en costos, diferenciación y enfoque. También se explora el concepto de cadena de valor y cómo cada actividad contribuye a la posición competitiva de la empresa.",
    fuentes: ["PDF 'Estrategia cap.1'", "Video 'Lección 1'"],
  },
  t2: {
    tema: "Análisis de mercado",
    estado: "en_progreso",
    resumen:
      "El análisis de mercado es el proceso sistemático de recopilar y evaluar información sobre un mercado objetivo. Según el material subido, los componentes clave incluyen el análisis de la demanda, la segmentación de clientes, el estudio de la competencia y la identificación de tendencias macroeconómicas. El material destaca que un análisis efectivo debe combinar datos cuantitativos con insights cualitativos para generar ventajas competitivas sostenibles.",
    fuentes: ["PDF 'Estrategia cap.3'", "Video 'Lección 4'", "Audio 'Clase 2'"],
  },
  t3: {
    tema: "Modelos de negocio",
    estado: "hueco",
    resumen:
      "Los modelos de negocio definen cómo una organización crea, entrega y captura valor. El material aborda el Business Model Canvas como herramienta principal, explorando sus nueve bloques constructivos: segmentos de clientes, propuestas de valor, canales, relaciones con clientes, fuentes de ingresos, recursos clave, actividades clave, socios clave y estructura de costos.",
    fuentes: ["PDF 'Estrategia cap.4'", "Video 'Lección 5'"],
  },
  t4: {
    tema: "Gestión de riesgo",
    estado: "pendiente",
    resumen:
      "La gestión de riesgo empresarial involucra la identificación, evaluación y priorización de riesgos seguida de la aplicación coordinada de recursos para minimizar, monitorear y controlar la probabilidad e impacto de eventos adversos. El material cubre frameworks como COSO ERM y técnicas de análisis cuantitativo de riesgo.",
    fuentes: ["PDF 'Estrategia cap.5'"],
  },
  t5: {
    tema: "Valuación de empresas",
    estado: "pendiente",
    resumen:
      "La valuación de empresas es el proceso de determinar el valor económico de un negocio o unidad de negocio. El material cubre métodos de valuación incluyendo flujo de caja descontado (DCF), múltiplos comparables, y valuación de activos. Se enfatiza la importancia de entender las suposiciones subyacentes en cada método.",
    fuentes: ["PDF 'Estrategia cap.6'", "Audio 'Clase 3'"],
  },
};

// Roleplay scenario
export const roleplayScenario: RoleplayScenario = {
  titulo: "Consultoría de entrada a mercado",
  descripcion:
    "Eres consultor estratégico y tu cliente, el Director de Expansión de una empresa de software B2B, acaba de pedirte una recomendación sobre si deben entrar al mercado latinoamericano este año o esperar. Tienen presupuesto limitado y dos competidores ya presentes en la región.",
  objetivos: [
    "Aplicar el framework de análisis de mercado del material",
    "Identificar los riesgos principales según el contenido subido",
    "Proponer una recomendación estructurada y justificada",
  ],
  tiempo_estimado: 12,
};

// Initial roleplay conversation
export const roleplayInitialMessage: RoleplayMessage = {
  rol: "cliente",
  nombre: "Carlos (Director de Expansión)",
  mensaje:
    "Mira, necesito que seas directo conmigo. Llevamos 6 meses evaluando esto y el board me presiona. ¿Entramos a Latam este año o no? Tengo presupuesto para una sola apuesta.",
};

// Mock roleplay responses from the client
export const roleplayClientResponses: string[] = [
  "Interesante punto. Pero los competidores ya tienen presencia en Brasil y México. ¿Cómo justificas que no es demasiado tarde?",
  "El board quiere ver números concretos. ¿Qué retorno podemos esperar en los primeros 18 meses?",
  "Eso tiene sentido. ¿Y qué pasa si el competidor principal baja precios para defenderse?",
  "Ok, dame tu recomendación final. ¿Entramos o no?",
];

// Roleplay evaluation
export const roleplayEvaluation: RoleplayEvaluation = {
  calificacion: 7.8,
  resumen:
    "Demostraste comprensión sólida del análisis competitivo pero la recomendación final careció de estructura cuantitativa.",
  positivos: [
    {
      punto:
        "Identificaste correctamente los dos riesgos principales de entrada temprana al mercado.",
      fuente: "PDF 'Estrategia cap.3', p.8",
    },
    {
      punto: "Usaste el framework de segmentación para justificar el timing.",
      fuente: "Video 'Lección 4', min 12:30",
    },
  ],
  mejoras: [
    {
      punto:
        "La recomendación final no incluyó métricas de éxito medibles, que el material señala como obligatorias.",
      fuente: "PDF 'Estrategia cap.3', p.14",
    },
    {
      punto:
        "No mencionaste el análisis de competidores existentes que se cubrió en el material.",
      fuente: "Audio 'Clase 2', min 8:15",
    },
  ],
};

// Tutor mock responses
export const tutorResponses: TutorMessage[] = [
  {
    rol: "tutor",
    mensaje:
      "Según tu material, los componentes clave de este tema se dividen en cuatro áreas principales. El material es especialmente claro en la parte de análisis competitivo.",
    referencias: [{ tipo: "pdf", label: "PDF cap.3, p.8" }],
  },
  {
    rol: "tutor",
    mensaje:
      "El material aborda esto desde una perspectiva práctica. Hay un ejemplo específico que ilustra bien el concepto que mencionas.",
    referencias: [{ tipo: "video", label: "Lección 4, 12:30" }],
  },
  {
    rol: "tutor",
    mensaje:
      "Encontré tres referencias sobre esto en tu material. La más completa está en el audio de la clase 2, donde se explica el proceso paso a paso.",
    referencias: [{ tipo: "audio", label: "Clase 2, 8:15" }],
  },
];

// Tutor suggestion capsules
export const tutorSuggestions = [
  "¿Qué temas cubre mi material?",
  "Resume el concepto principal",
  "¿Qué debería estudiar primero?",
];

// Diagnostic questions
export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    seccion: "Tu conocimiento previo",
    pregunta:
      "¿Cuánta experiencia tienes con análisis estratégico antes de subir este material?",
    tipo: "opcion",
    opciones: [
      "Ninguna — es tema nuevo",
      "Básica — conozco los conceptos",
      "Intermedia — lo he aplicado antes",
      "Avanzada — es mi área de trabajo",
    ],
  },
  {
    seccion: "Tu conocimiento previo",
    pregunta:
      "¿Conoces los conceptos de análisis financiero y contabilidad básica?",
    tipo: "opcion",
    opciones: [
      "No los conozco",
      "Los conozco superficialmente",
      "Los domino bien",
    ],
  },
  {
    seccion: "Tu conocimiento previo",
    pregunta:
      "¿Has trabajado con frameworks de estrategia como Porter, FODA o Canvas?",
    tipo: "opcion",
    opciones: [
      "No",
      "He escuchado de ellos",
      "Los conozco y he usado alguno",
      "Los uso regularmente",
    ],
  },
  {
    seccion: "Tu material actual",
    pregunta:
      "¿Hasta qué punto crees que llega la profundidad de tu material subido?",
    tipo: "opcion",
    opciones: [
      "Conceptos básicos",
      "Aplicación intermedia",
      "Casos avanzados",
      "No estoy seguro",
    ],
  },
  {
    seccion: "Tu material actual",
    pregunta:
      "¿Hay temas del material que ya dominas y no necesitas practicar?",
    tipo: "abierta",
    placeholder: "Ej: el análisis FODA ya lo domino bien...",
  },
];

// Global progress data
export const globalProgress: GlobalProgress = {
  stats: {
    categorias: 4,
    temas: 31,
    roleplays: 7,
    racha_dias: 4,
  },
  categorias: [
    {
      nombre: "Estrategia de Negocios",
      progreso: 78,
      ultimo_tema: "Gestión de riesgo",
      ultima_sesion: "hace 2h",
    },
    {
      nombre: "IA Aplicada",
      progreso: 52,
      ultimo_tema: "Redes neuronales",
      ultima_sesion: "hace 1d",
    },
    {
      nombre: "Derecho Fiscal",
      progreso: 18,
      ultimo_tema: "IVA",
      ultima_sesion: "hace 5d",
    },
    {
      nombre: "Marketing Digital",
      progreso: 35,
      ultimo_tema: "SEO técnico",
      ultima_sesion: "hace 2d",
    },
  ],
  roleplays_recientes: [
    {
      tema: "Gestión de riesgo",
      categoria: "Estrategia de Negocios",
      calificacion: 8.2,
      fecha: "hace 2h",
    },
    {
      tema: "Redes neuronales",
      categoria: "IA Aplicada",
      calificacion: 7.5,
      fecha: "hace 1d",
    },
    {
      tema: "IVA básico",
      categoria: "Derecho Fiscal",
      calificacion: 6.1,
      fecha: "hace 5d",
    },
  ],
};

// Processing steps by file type
export const getProcessingSteps = (type: string): string[] => {
  switch (type) {
    case "pdf":
      return [
        "Archivo recibido",
        "Extrayendo texto",
        "Generando embeddings",
        "Indexando para consulta",
        "Listo",
      ];
    case "pdf-scanned":
      return [
        "Archivo recibido",
        "Procesando imagen con IA (OCR)",
        "Extrayendo texto",
        "Generando embeddings",
        "Indexando para consulta",
        "Listo",
      ];
    case "audio":
      return [
        "Archivo recibido",
        "Transcribiendo audio",
        "Generando embeddings",
        "Indexando para consulta",
        "Listo",
      ];
    case "video":
    case "url":
      return [
        "Archivo recibido",
        "Descargando y transcribiendo audio",
        "Generando embeddings",
        "Indexando para consulta",
        "Listo",
      ];
    case "doc":
    default:
      return [
        "Archivo recibido",
        "Extrayendo contenido",
        "Generando embeddings",
        "Indexando para consulta",
        "Listo",
      ];
  }
};

// Detected topics for categorization modal (mock AI detection)
export const detectedTopics = [
  "Análisis de mercado",
  "Estrategia competitiva",
  "Segmentación de clientes",
];
