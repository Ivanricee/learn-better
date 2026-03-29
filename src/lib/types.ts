// Category types
export interface Category {
  id: number;
  nombre: string;
  temas: number;
  progreso: number;
}

// Theme/Topic types
export type ThemeStatus = "dominado" | "en_progreso" | "hueco" | "pendiente";

export interface Theme {
  id: string;
  nombre: string;
  estado: ThemeStatus;
  pendientes?: number;
}

export interface Temario {
  zona1: Theme[]; // Prerequisites
  zona2: Theme[]; // User material
  zona3: Theme[]; // Next steps
}

// Theme detail types
export interface ThemeDetail {
  tema: string;
  estado: ThemeStatus;
  resumen: string;
  fuentes: string[];
}

// Roleplay types
export interface RoleplayScenario {
  titulo: string;
  descripcion: string;
  objetivos: string[];
  tiempo_estimado: number;
}

export interface RoleplayMessage {
  rol: "cliente" | "usuario";
  nombre?: string;
  mensaje: string;
  timestamp?: Date;
}

export interface RoleplayEvaluation {
  calificacion: number;
  resumen: string;
  positivos: { punto: string; fuente: string }[];
  mejoras: { punto: string; fuente: string }[];
}

// Tutor types
export interface TutorReference {
  tipo: "pdf" | "video" | "audio";
  label: string;
}

export interface TutorMessage {
  rol: "tutor" | "usuario";
  mensaje: string;
  referencias?: TutorReference[];
  timestamp?: Date;
}

// Processing types
export type FileType =
  | "pdf"
  | "pdf-scanned"
  | "audio"
  | "video"
  | "url"
  | "doc";
export type ProcessingStatus = "processing" | "done" | "error";

export interface ProcessingItem {
  id: string;
  filename: string;
  type: FileType;
  currentStep: number;
  steps: string[];
  status: ProcessingStatus;
}

// Diagnostic types
export interface DiagnosticQuestion {
  seccion: string;
  pregunta: string;
  tipo: "opcion" | "abierta";
  opciones?: string[];
  placeholder?: string;
}

// Progress types
export interface ProgressStats {
  categorias: number;
  temas: number;
  roleplays: number;
  racha_dias: number;
}

export interface CategoryProgress {
  nombre: string;
  progreso: number;
  ultimo_tema: string;
  ultima_sesion: string;
}

export interface RecentRoleplay {
  tema: string;
  categoria: string;
  calificacion: number;
  fecha: string;
}

export interface GlobalProgress {
  stats: ProgressStats;
  categorias: CategoryProgress[];
  roleplays_recientes: RecentRoleplay[];
}
// Resource types
export type ResourceType =
  | "youtube"
  | "tiktok"
  | "pdf"
  | "audio"
  | "video"
  | "text"
  | "image"
  | "markdown"
  | "url";
export type ResourceStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "done"
  | "error";

export interface Resource {
  id: string;
  categoryId: number;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  progress: number; // 0-100
  url?: string;
  createdAt: Date;
}
// App state types
export type ViewType = "home" | "progress" | "settings";
export type ActivityType =
  | "theme"
  | "roleplay"
  | "roleplay-eval"
  | "quiz"
  | "flashcards"
  | "progress"
  | null;
export type RightPanelTab = "tutor" | "resource";
export type LeftPanelTab = "temario" | "recursos";
