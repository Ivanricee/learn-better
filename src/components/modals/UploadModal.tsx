"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  X,
  Upload,
  Link2,
  FileText,
  Video,
  Music,
  Image,
  Loader2,
} from "lucide-react";
import { useResourcesStore, useAppStore } from "@/lib/stores/zustand-store";
import type { ResourceType } from "@/lib/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

function getResourceType(file: File): ResourceType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (file.type.includes("pdf") || ext === "pdf") return "pdf";
  if (
    file.type.includes("audio") ||
    ["mp3", "wav", "ogg", "m4a"].includes(ext || "")
  )
    return "audio";
  if (
    file.type.includes("video") ||
    ["mp4", "webm", "mov", "avi"].includes(ext || "")
  )
    return "video";
  return "text";
}

function getUrlResourceType(url: string): ResourceType {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  return "url";
}

function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "Video de YouTube";
    }
    if (url.includes("tiktok.com")) {
      const pathParts = urlObj.pathname.split("/");
      const username = pathParts.find((p) => p.startsWith("@")) || "@creator";
      return `TikTok ${username}`;
    }
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "Enlace externo";
  }
}

export function UploadModal({ isOpen, onClose, categoryId }: UploadModalProps) {
  const { addResource, updateResourceStatus, updateResourceProgress } =
    useResourcesStore();
  const { setLeftPanelTab } = useAppStore();
  const [urlInput, setUrlInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<
    { name: string; type: ResourceType }[]
  >([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      name: file.name,
      type: getResourceType(file),
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
      "video/*": [".mp4", ".webm", ".mov"],
      "text/plain": [".txt"],
      "application/msword": [".doc", ".docx"],
    },
  });

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    const type = getUrlResourceType(urlInput);
    const name = getFilenameFromUrl(urlInput);
    setPendingFiles((prev) => [...prev, { name, type }]);
    setUrlInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddUrl();
    }
  };

  const handleClose = () => {
    setPendingFiles([]);
    setUrlInput("");
    onClose();
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (pendingFiles.length === 0) return;

    setIsAdding(true);

    // Add all resources to store
    const resourceIds: string[] = [];
    for (const file of pendingFiles) {
      const id = addResource({
        categoryId,
        name: file.name,
        type: file.type,
      });
      resourceIds.push(id);
    }

    // Switch to resources tab to show progress
    setLeftPanelTab("recursos");

    // Close modal
    setIsAdding(false);
    handleClose();

    // Simulate upload progress for each resource
    for (const id of resourceIds) {
      simulateUpload(id);
    }
  };

  const simulateUpload = async (resourceId: string) => {
    // Start uploading
    updateResourceStatus(resourceId, "uploading");

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300),
      );
      updateResourceProgress(resourceId, progress);
    }

    // Start processing
    updateResourceStatus(resourceId, "processing");

    // Simulate processing time
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 2000),
    );

    // Mark as done
    updateResourceStatus(resourceId, "done");
  };

  const getFileIcon = (type: ResourceType) => {
    switch (type) {
      case "youtube":
      case "video":
        return <Video className="w-4 h-4" />;
      case "tiktok":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "pdf":
      case "text":
        return <FileText className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--background-panel)] rounded-2xl border border-[var(--border)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-display font-semibold text-lg text-[var(--foreground)]">
            Agregar material
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              relative flex flex-col items-center justify-center gap-3 p-8
              border-2 border-dashed rounded-xl cursor-pointer
              transition-all duration-200
              ${
                isDragActive
                  ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                  : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--background-hover)]"
              }
            `}
          >
            <input {...getInputProps()} />
            <div
              className={`p-3 rounded-full ${isDragActive ? "bg-[var(--primary)]/20" : "bg-[var(--background-hover)]"}`}
            >
              <Upload
                className={`w-6 h-6 ${isDragActive ? "text-[var(--primary)]" : "text-[var(--foreground-tertiary)]"}`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--foreground)]">
                {isDragActive
                  ? "Suelta los archivos aqui"
                  : "Arrastra archivos o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                PDF, audio, video, documentos de texto
              </p>
            </div>
          </div>

          {/* URL input */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--foreground-secondary)]">
              O pega un enlace
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <button
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[var(--background-hover)] text-sm text-[var(--foreground)] hover:bg-[var(--background)] border border-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Pending files list */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--foreground-secondary)]">
                Archivos a subir ({pendingFiles.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {pendingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-subtle)]"
                  >
                    <div className="p-1.5 rounded-md bg-[var(--primary-muted)] text-[var(--primary)]">
                      {getFileIcon(file.type)}
                    </div>
                    <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removePendingFile(index)}
                      className="p-1 rounded text-[var(--foreground-tertiary)] hover:text-[var(--alert)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={pendingFiles.length === 0 || isAdding}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--primary)] text-sm font-medium text-[var(--background)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agregando...
              </>
            ) : (
              "Agregar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
