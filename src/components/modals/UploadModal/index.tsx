"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore, useResourcesStore } from "@/lib/stores/zustand-store";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_MIME_TYPES,
  FILE_SIZE_LABELS,
  uploadUrlSchema,
  type UploadUrlFormValues,
  validateFile,
} from "../schemas/upload.schema";
import { PendingResourcesList } from "./PendingResourcesList";
import type { PendingResource, UploadModalProps } from "./types";
import { UploadDropzone } from "./UploadDropzone";
import { UploadUrlInput } from "./UploadUrlInput";
import {
  getFilePendingKey,
  getFilenameFromUrl,
  getResourceType,
  getUrlPendingKey,
  getUrlResourceType,
  SUPPORTED_TYPES_LABEL,
} from "./utils";

const FILE_LIMITS = [
  ["Audio", FILE_SIZE_LABELS.audio],
  ["Video", FILE_SIZE_LABELS.video],
  ["Imagen", FILE_SIZE_LABELS.image],
  ["PDF", FILE_SIZE_LABELS.pdf],
  ["Texto/MD", FILE_SIZE_LABELS.text],
] as const;

const FILE_DURATION_LABEL =
  "Audio y video: duración mínima recomendada de 2 horas.";
const URL_DURATION_LABEL =
  "Videos por enlace: duración mínima recomendada de 2 horas.";

export function UploadModal({ isOpen, onClose, categoryId }: UploadModalProps) {
  const {
    addResource,
    updateResourceProgress,
    updateResourceStatus,
    updateResourceJobId,
    updateResourceError,
  } = useResourcesStore();
  const { setLeftPanelTab } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingResource[]>([]);
  const [dropError, setDropError] = useState<string | null>(null);
  const activeIntervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(
    new Set(),
  );

  const appendUniquePending = useCallback((incoming: PendingResource[]) => {
    if (incoming.length === 0) return;

    setPendingFiles((prev) => {
      const existingKeys = new Set(prev.map((item) => item.key));
      const uniqueIncoming = incoming.filter(
        (item) => !existingKeys.has(item.key),
      );
      if (uniqueIncoming.length === 0) return prev;
      return [...prev, ...uniqueIncoming];
    });
  }, []);

  const {
    register,
    handleSubmit,
    reset: resetUrl,
    formState: { errors: urlErrors },
  } = useForm<UploadUrlFormValues>({
    resolver: zodResolver(uploadUrlSchema),
    mode: "onSubmit",
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setDropError(null);
      const newFiles: PendingResource[] = [];
      const seenDroppedKeys = new Set<string>();
      const fileErrors: string[] = [];

      for (const file of acceptedFiles) {
        const error = validateFile(file);

        if (error) {
          fileErrors.push(`${file.name}: ${error}`);
          continue;
        }

        const type = getResourceType(file);
        const key = getFilePendingKey(file.name, type);

        if (seenDroppedKeys.has(key)) {
          continue;
        }

        seenDroppedKeys.add(key);
        newFiles.push({ key, name: file.name, type, file });
      }

      if (fileErrors.length > 0) {
        setDropError(fileErrors.join(" · "));
      }

      appendUniquePending(newFiles);
    },
    [appendUniquePending],
  );

  const onDropRejected = useCallback(() => {
    setDropError(
      "Formato no compatible. Revisa los tipos y tamaños permitidos.",
    );
  }, []);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    onDragEnter: () => setDropError(null),
    accept: ACCEPTED_MIME_TYPES,
  });

  const onSubmitUrl = (data: UploadUrlFormValues) => {
    const type = getUrlResourceType(data.url);
    const name = getFilenameFromUrl(data.url);
    const key = getUrlPendingKey(data.url);

    appendUniquePending([{ key, name, type, sourceUrl: data.url }]);
    resetUrl();
  };

  const handleUrlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmit(onSubmitUrl)();
  };

  const handleClose = () => {
    activeIntervalsRef.current.forEach((id) => clearInterval(id));
    activeIntervalsRef.current.clear();
    setPendingFiles([]);
    setDropError(null);
    resetUrl();
    onClose();
  };

  useEffect(() => {
    return () => {
      activeIntervalsRef.current.forEach((id) => clearInterval(id));
      activeIntervalsRef.current.clear();
    };
  }, []);

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const pollJobStatus = useCallback(
    (jobId: string, resourceId: string) => {
      console.log(
        `🔄 [Polling] Iniciando polling para job ${jobId}, resource ${resourceId}`,
      );

      const interval = setInterval(async () => {
        try {
          console.log(`📡 [Polling] Consultando /api/jobs/${jobId}...`);

          const response = await fetch(`/api/jobs/${jobId}`);

          console.log(`📥 [Polling] Respuesta:`, {
            ok: response.ok,
            status: response.status,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [Polling] Error al consultar job:`, errorText);
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
            updateResourceStatus(resourceId, "error");
            return;
          }

          const job = await response.json();
          console.log(
            `📊 [${new Date().toISOString()}] [Polling] Estado del job:`,
            {
              status: job.status,
              step: job.step,
              progress: job.progress,
              error_type: job.error_type,
            },
          );

          // Actualizar progreso y status
          updateResourceProgress(resourceId, job.progress || 0);

          // Mapear status de job a status de resource
          if (job.status === "done") {
            console.log(`✅ [Polling] Job completado, deteniendo polling`);
            updateResourceStatus(resourceId, "done");
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
          } else if (job.status === "error" || job.status === "cancelled") {
            console.log(
              `❌ [Polling] Job con error/cancelado, deteniendo polling`,
            );
            updateResourceStatus(resourceId, job.status);
            if (job.error_message) {
              updateResourceError(resourceId, job.error_message);
            }
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
          } else if (job.status === "processing") {
            console.log(
              `⚙️ [Polling] Job en procesamiento, actualizando UI...`,
            );
            updateResourceStatus(resourceId, "processing");
          } else if (job.status === "pending" || job.status === "queued") {
            console.log(
              `⏳ [Polling] Job en cola (${job.status}), actualizando UI...`,
            );
            updateResourceStatus(resourceId, job.status);
          } else {
            console.warn(
              `⚠️ [Polling] Status desconocido: "${job.status}" - NO se actualiza UI`,
            );
          }
        } catch (error) {
          console.error("❌ [Polling] Error general:", error);
          clearInterval(interval);
          activeIntervalsRef.current.delete(interval);
          updateResourceStatus(resourceId, "error");
        }
      }, 2000); // Poll cada 2 segundos

      activeIntervalsRef.current.add(interval);
    },
    [updateResourceProgress, updateResourceStatus, updateResourceError],
  );

  const uploadSingleFile = useCallback(
    async (file: PendingResource, index: number, total: number) => {
      console.log(
        `\n📄 [UploadModal] Procesando archivo ${index + 1}/${total}:`,
        { name: file.name, type: file.type, sourceUrl: file.sourceUrl },
      );

      const resourceId = addResource({
        categoryId: categoryId.toString(),
        name: file.name,
        type: file.type,
      });

      console.log(`✅ [UploadModal] Resource creado en Zustand:`, resourceId);

      const formData = new FormData();
      formData.append("categoryId", categoryId.toString());

      if (file.sourceUrl) {
        console.log(`🔗 [UploadModal] URL detectada: ${file.sourceUrl}`);
        formData.append("sourceUrl", file.sourceUrl);
      } else if (file.file) {
        console.log(
          `📁 [UploadModal] Archivo local: ${file.file.name} (${file.file.size} bytes)`,
        );
        formData.append("file", file.file);
        formData.append("name", file.name);
      } else {
        console.error(`❌ [UploadModal] Sin sourceUrl ni file object:`, file);
        updateResourceStatus(resourceId, "error");
        return;
      }

      try {
        console.log(`📤 [UploadModal] Enviando a /api/upload...`);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        console.log(`📥 [UploadModal] Respuesta de /api/upload:`, {
          ok: response.ok,
          status: response.status,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `❌ [UploadModal] Error en /api/upload.`,
            response.status,
            errorText,
          );
          updateResourceStatus(resourceId, "error");
          return;
        }

        const responseData = await response.json();
        console.log(`✅ [UploadModal] Job creado:`, responseData);

        const { jobId } = responseData;
        updateResourceJobId(resourceId, jobId);

        console.log(`🔄 [UploadModal] Iniciando polling para job:`, jobId);
        pollJobStatus(jobId, resourceId);
      } catch (error) {
        console.error(`❌ [UploadModal] Error subiendo archivo:`, error);
        updateResourceStatus(resourceId, "error");
      }
    },
    [
      addResource,
      categoryId,
      updateResourceStatus,
      updateResourceJobId,
      pollJobStatus,
    ],
  );

  const handleConfirm = async () => {
    if (pendingFiles.length === 0) return;

    console.log("🚀 [UploadModal] Iniciando upload de archivos:", pendingFiles);
    console.log(
      `📊 [UploadModal] Total de archivos a procesar: ${pendingFiles.length}`,
    );
    setIsAdding(true);

    const filesToUpload = [...pendingFiles];

    setLeftPanelTab("recursos");
    setPendingFiles([]);
    setIsAdding(false);
    onClose();

    const total = filesToUpload.length;
    filesToUpload.forEach((file, index) => {
      uploadSingleFile(file, index, total);
    });

    console.log(`\n✅ [UploadModal] ${total} upload(s) lanzados en paralelo`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg bg-[var(--background-panel)] rounded-2xl border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-display font-semibold text-lg text-[var(--foreground)]">
            Agregar material
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <UploadDropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            hasDropError={!!dropError}
            dropError={dropError}
            supportedTypesLabel={SUPPORTED_TYPES_LABEL}
            fileLimits={FILE_LIMITS}
            fileDurationLabel={FILE_DURATION_LABEL}
          />

          <UploadUrlInput
            register={register}
            urlErrors={urlErrors}
            onSubmitUrl={handleSubmit(onSubmitUrl)}
            onUrlKeyDown={handleUrlKeyDown}
            urlDurationLabel={URL_DURATION_LABEL}
          />

          <PendingResourcesList
            pendingFiles={pendingFiles}
            removePendingFile={removePendingFile}
          />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="h-9 rounded-xl px-4 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={pendingFiles.length === 0 || isAdding}
            className="h-9 rounded-xl px-5 text-sm"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Agregando...
              </>
            ) : (
              "Agregar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
