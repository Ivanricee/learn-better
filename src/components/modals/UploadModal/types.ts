import type { ResourceType } from "@/lib/types";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

export interface PendingResource {
  key: string;
  name: string;
  type: ResourceType;
  sourceUrl?: string; // URL original para recursos de tipo youtube/tiktok/instagram
  file?: File; // File object para archivos locales (pdf, video, audio, imagen, texto)
}
