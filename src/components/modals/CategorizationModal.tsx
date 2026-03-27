"use client";

import { useState } from "react";
import { X, FileText, AlertTriangle, Video, Music, Globe } from "lucide-react";

import type { FileType } from "@/lib/types";
import { detectedTopics } from "@/lib/mock-data";
import { useCategoryStore } from "@/lib/stores/zustand-store";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: number | null, newCategoryName?: string) => void;
  filename: string;
  fileType: FileType;
  preselectedCategoryId?: number;
}

const fileIconMap: Record<string, React.ElementType> = {
  pdf: FileText,
  "pdf-scanned": FileText,
  doc: FileText,
  video: Video,
  audio: Music,
  url: Globe,
};

// Check if content might be sensitive (medicine, law, finance)
const isSensitiveContent = (filename: string): boolean => {
  const sensitiveKeywords = [
    "medicina",
    "medical",
    "derecho",
    "legal",
    "fiscal",
    "finanzas",
    "finance",
    "salud",
    "health",
  ];
  return sensitiveKeywords.some((keyword) =>
    filename.toLowerCase().includes(keyword),
  );
};

export function CategorizationModal({
  isOpen,
  onClose,
  onConfirm,
  filename,
  fileType,
  preselectedCategoryId,
}: CategorizationModalProps) {
  const categories = useCategoryStore((state) => state.categories);
  const suggestedCategoryId = categories[0]?.id ?? null;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    preselectedCategoryId ?? suggestedCategoryId,
  );
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const FileIconComponent = fileIconMap[fileType] ?? FileText;
  const showSensitiveWarning = isSensitiveContent(filename);

  const handleConfirm = () => {
    if (isNewCategory && newCategoryName.trim()) {
      onConfirm(null, newCategoryName.trim());
    } else if (selectedCategoryId) {
      onConfirm(selectedCategoryId);
    }
  };

  const handleCategorySelect = (id: number | null) => {
    if (id === null) {
      setIsNewCategory(true);
      setSelectedCategoryId(null);
      setNewCategoryName("");
    } else {
      setIsNewCategory(false);
      setSelectedCategoryId(id);
      setNewCategoryName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg p-6 rounded-2xl bg-card border border-border ring-0 text-foreground gap-0"
      >
        <DialogTitle className="sr-only">Categorizar archivo</DialogTitle>

        {/* Close button */}
        <DialogClose asChild>
          <button className="absolute top-4 right-4 p-1 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-background-elevated transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </DialogClose>

        {/* File info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-background-elevated">
            <FileIconComponent className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-foreground truncate">
            {filename}
          </span>
        </div>

        {/* Detected topics */}
        <div className="mb-6">
          <p className="text-sm text-foreground-secondary mb-2">
            La IA detectó:
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedTopics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 rounded-full text-xs bg-background-elevated border border-border-subtle text-foreground-secondary"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Category selection */}
        <div className="mb-4">
          <p className="text-sm text-foreground-secondary mb-3">
            Categoría sugerida:
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Suggested category (first one) */}
            {categories[0] && (
              <button
                onClick={() => handleCategorySelect(categories[0].id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                  selectedCategoryId === categories[0].id && !isNewCategory
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border text-foreground-secondary hover:border-primary"
                }`}
              >
                {categories[0].nombre}
              </button>
            )}

            {/* New category option */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                isNewCategory
                  ? "border-primary bg-primary-muted text-primary"
                  : "border-border text-foreground-secondary hover:border-primary"
              }`}
            >
              Nueva categoría...
            </button>
          </div>

          {/* New category input */}
          {isNewCategory && (
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="Nombre de la categoría"
              className="mt-3 w-full px-4 py-2 rounded-xl bg-input border border-border text-foreground placeholder:text-foreground-tertiary focus:border-primary outline-none transition-colors duration-150"
              autoFocus
            />
          )}
        </div>

        {/* Other categories */}
        <div className="mb-6">
          <p className="text-sm text-foreground-tertiary mb-2">O elige otra:</p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                  selectedCategoryId === category.id
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border text-foreground-secondary hover:border-primary"
                }`}
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Sensitive content warning */}
        {showSensitiveWarning && (
          <div className="mb-6 p-3 rounded-xl bg-secondary-muted border border-secondary">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-secondary">
                Este material puede contener información sensible. Las
                respuestas incluirán un aviso automático.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground-secondary hover:border-border-hover hover:text-foreground transition-all duration-150">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleConfirm}
            disabled={isNewCategory && !newCategoryName.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-background hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
