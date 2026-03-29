"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Upload,
  Link2,
  FileText,
  Video,
  Music,
  Image,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useResourcesStore, useAppStore } from "@/lib/stores/zustand-store";
import type { ResourceType } from "@/lib/types";
import {
  uploadUrlSchema,
  type UploadUrlFormValues,
  validateFile,
  ACCEPTED_MIME_TYPES,
  FILE_SIZE_LABELS,
} from "./schemas/upload.schema";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
}

function getResourceType(file: File): ResourceType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (file.type.includes("pdf") || ext === "pdf") return "pdf";
  if (ext === "md") return "markdown";
  if (
    file.type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "avif"].includes(ext || "")
  )
    return "image";
  if (
    file.type.includes("audio") ||
    ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext || "")
  )
    return "audio";
  if (file.type.includes("video") || ["mp4", "webm", "mov"].includes(ext || ""))
    return "video";
  return "text";
}

function getUrlResourceType(url: string): ResourceType {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "url";
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
    if (url.includes("instagram.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const username = pathParts[0] ? `@${pathParts[0]}` : "";
      return `Instagram ${username}`.trim();
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
  const [isAdding, setIsAdding] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<
    { name: string; type: ResourceType }[]
  >([]);
  const [dropError, setDropError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetUrl,
    formState: { errors: urlErrors },
  } = useForm<UploadUrlFormValues>({
    resolver: zodResolver(uploadUrlSchema),
    mode: "onSubmit",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDropError(null);
    const newFiles: { name: string; type: ResourceType }[] = [];
    const fileErrors: string[] = [];

    for (const file of acceptedFiles) {
      const error = validateFile(file);
      if (error) {
        fileErrors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push({ name: file.name, type: getResourceType(file) });
      }
    }

    if (fileErrors.length > 0) {
      setDropError(fileErrors.join(" · "));
    }

    if (newFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    setDropError(
      "Formato no compatible. Revisa los tipos y tamaños permitidos.",
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    onDragEnter: () => setDropError(null),
    accept: ACCEPTED_MIME_TYPES,
  });

  const onSubmitUrl = (data: UploadUrlFormValues) => {
    const type = getUrlResourceType(data.url);
    const name = getFilenameFromUrl(data.url);
    setPendingFiles((prev) => [...prev, { name, type }]);
    resetUrl();
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmitUrl)();
    }
  };

  const handleClose = () => {
    setPendingFiles([]);
    setDropError(null);
    resetUrl();
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
      case "image":
        return <Image className="w-4 h-4" />;
      case "pdf":
      case "text":
      case "markdown":
        return <FileText className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  const hasDropError = !!dropError;

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
          <div>
            <div
              {...getRootProps()}
              className={`
                relative flex flex-col items-center justify-center gap-3 p-8
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200
                ${
                  hasDropError
                    ? "border-[var(--alert)] bg-[var(--alert)]/5"
                    : isDragActive
                      ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                      : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--background-hover)]"
                }
              `}
            >
              <input {...getInputProps()} />
              <div
                className={`p-3 rounded-full ${
                  hasDropError
                    ? "bg-[var(--alert)]/15"
                    : isDragActive
                      ? "bg-[var(--primary)]/20"
                      : "bg-[var(--background-hover)]"
                }`}
              >
                {hasDropError ? (
                  <AlertCircle className="w-6 h-6 text-[var(--alert)]" />
                ) : (
                  <Upload
                    className={`w-6 h-6 ${isDragActive ? "text-[var(--primary)]" : "text-[var(--foreground-tertiary)]"}`}
                  />
                )}
              </div>
              <div className="text-center">
                {hasDropError ? (
                  <p className="text-sm font-medium text-[var(--alert)]">
                    {dropError}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--foreground)]">
                    {isDragActive
                      ? "Suelta los archivos aquí"
                      : "Arrastra archivos o haz clic para seleccionar"}
                  </p>
                )}
                <p className="text-xs text-[var(--foreground-tertiary)] mt-1.5">
                  PDF · Audio · Video · Imagen · Texto · Markdown
                </p>
                <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">
                  Audio {FILE_SIZE_LABELS.audio} · Video{" "}
                  {FILE_SIZE_LABELS.video} · Imagen {FILE_SIZE_LABELS.image} ·
                  PDF {FILE_SIZE_LABELS.pdf} · Texto/MD {FILE_SIZE_LABELS.text}
                </p>
              </div>
            </div>
          </div>

          {/* URL input */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--foreground-secondary)]">
              Pega un enlace de YouTube, Instagram o TikTok
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
                <input
                  type="text"
                  {...register("url")}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="https://youtube.com/watch?v=..., instagram.com/p/..., tiktok.com/@..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--background)] border text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none transition-colors ${
                    urlErrors.url
                      ? "border-[var(--alert)] focus:border-[var(--alert)]"
                      : "border-[var(--border)] focus:border-[var(--primary)]"
                  }`}
                />
              </div>
              <button
                onClick={handleSubmit(onSubmitUrl)}
                className="px-4 py-2.5 rounded-xl bg-[var(--background-hover)] text-sm text-[var(--foreground)] hover:bg-[var(--background)] border border-[var(--border)] transition-colors"
              >
                Agregar
              </button>
            </div>
            {urlErrors.url && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--alert)]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {urlErrors.url.message}
              </p>
            )}
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
