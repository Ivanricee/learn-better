"use client";

import { useState } from "react";
import { X, FileText, AlertTriangle, Video, Music, Globe } from "lucide-react";

import type { FileType } from "@/lib/types";
import { categories, detectedTopics } from "@/lib/mock-data";

interface CategorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: number | null, newCategoryName?: string) => void;
  filename: string;
  fileType: FileType;
  preselectedCategoryId?: number;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "pdf":
    case "pdf-scanned":
    case "doc":
      return FileText;
    case "video":
      return Video;
    case "audio":
      return Music;
    case "url":
      return Globe;
    default:
      return FileText;
  }
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    preselectedCategoryId || 1,
  );
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  if (!isOpen) return null;

  const FileIcon = getFileIcon(fileType);
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
    } else {
      setIsNewCategory(false);
      setSelectedCategoryId(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors duration-150"
        >
          <X className="w-5 h-5" />
        </button>

        {/* File info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[var(--background-elevated)]">
            <FileIcon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <span className="font-medium text-[var(--foreground)] truncate">
            {filename}
          </span>
        </div>

        {/* Detected topics */}
        <div className="mb-6">
          <p className="text-sm text-[var(--foreground-secondary)] mb-2">
            La IA detectó:
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedTopics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 rounded-full text-xs bg-[var(--background-elevated)] border border-[var(--border-subtle)] text-[var(--foreground-secondary)]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Category selection */}
        <div className="mb-4">
          <p className="text-sm text-[var(--foreground-secondary)] mb-3">
            Categoría sugerida:
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Suggested category (first one) */}
            <button
              onClick={() => handleCategorySelect(1)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                selectedCategoryId === 1 && !isNewCategory
                  ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)]"
              }`}
            >
              {categories[0].nombre}
            </button>

            {/* New category option */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                isNewCategory
                  ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)]"
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
              placeholder="Nombre de la categoría"
              className="mt-3 w-full px-4 py-2 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--primary)] outline-none transition-colors duration-150"
              autoFocus
            />
          )}
        </div>

        {/* Other categories */}
        <div className="mb-6">
          <p className="text-sm text-[var(--foreground-tertiary)] mb-2">
            O elige otra:
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                  selectedCategoryId === category.id
                    ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)]"
                }`}
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Sensitive content warning */}
        {showSensitiveWarning && (
          <div className="mb-6 p-3 rounded-xl bg-[var(--secondary-muted)] border border-[var(--secondary)]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--secondary)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--secondary)]">
                Este material puede contener información sensible. Las
                respuestas incluirán un aviso automático.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)] transition-all duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isNewCategory && !newCategoryName.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
