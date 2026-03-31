// Category types
export interface Category {
  id: string; // UUID
  nombre: string;
  temas: number; // Calculado dinámicamente: COUNT de topics
  progreso: number; // Calculado dinámicamente: % actividades completadas
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
  | "instagram"
  | "pdf"
  | "audio"
  | "video"
  | "text"
  | "image"
  | "markdown"
  | "url";
export type ResourceStatus =
  | "queued"
  | "pending"
  | "uploading"
  | "processing"
  | "done"
  | "error"
  | "cancelled";

export interface Resource {
  id: string;
  jobId?: string; // UUID del job en la tabla jobs
  categoryId: string; // UUID
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  progress: number; // 0-100
  url?: string;
  error_message?: string; // Mensaje de error si status=error
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

// Job types (worker processing)
export type JobStatus =
  | "queued"
  | "pending"
  | "processing"
  | "done"
  | "error"
  | "cancelled";

export type JobStep =
  | "uploading"
  | "downloading"
  | "converting"
  | "transcribing"
  | "extracting"
  | "vectorizing"
  | "generating_temario"
  | "done";

export type ErrorType =
  | "file_too_long"
  | "whisper_quota"
  | "conversion_failed"
  | "upload_incomplete"
  | "connection_error"
  | "unsupported_format"
  | "download_failed"
  | "extraction_failed"
  | "vectorization_failed"
  | "temario_failed"
  | "audio_too_long";

export interface Job {
  id: string; // UUID
  file_id: string; // UUID
  category_id: string; // UUID
  status: JobStatus;
  step: JobStep | null;
  progress: number; // 0-100
  error_type: ErrorType | null;
  error_message: string | null;
  pid: number | null;
  retry_count: number;
  created_at: Date;
  updated_at: Date;
}

// Topic types (temario)
export interface Topic {
  id: string; // UUID
  category_id: string; // UUID
  nombre: string;
  zona: "zona1" | "zona2" | "zona3";
  estado: ThemeStatus;
  orden: number | null;
  created_at: Date;
}

// Activity types
export type ActivityTypeDB = "quiz_multiple" | "flashcard" | "roleplay";

export interface Activity {
  id: string; // UUID
  topic_id: string; // UUID
  category_id: string; // UUID
  type: ActivityTypeDB;
  label: string;
  completed: boolean;
  score: number | null;
  created_at: Date;
}
