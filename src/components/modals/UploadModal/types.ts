import type { ResourceType } from "@/lib/types";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

export interface PendingResource {
  key: string;
  name: string;
  type: ResourceType;
}
