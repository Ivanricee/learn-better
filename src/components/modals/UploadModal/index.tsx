"use client";

import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/lib/stores/zustand-store";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useJobPolling } from "@/hooks/use-job-polling";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ACCEPTED_MIME_TYPES,
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
} from "./utils";

const URL_DURATION_LABEL =
  "Videos por enlace: duración mínima recomendada de 2 horas.";

export function UploadModal({ isOpen, onClose, categoryId }: UploadModalProps) {
  const { setLeftPanelTab } = useAppStore();
  const { uploadMultipleFiles } = useFileUpload(categoryId);
  const { clearAllPolling } = useJobPolling();

  const [isAdding, setIsAdding] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingResource[]>([]);
  const [dropError, setDropError] = useState<string | null>(null);

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
    defaultValues: {
      url: "",
    },
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
    clearAllPolling();
    setPendingFiles([]);
    setDropError(null);
    resetUrl();
    onClose();
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleConfirm = async () => {
    if (pendingFiles.length === 0) return;

    setIsAdding(true);

    const filesToUpload = [...pendingFiles];

    setLeftPanelTab("recursos");
    setPendingFiles([]);

    await uploadMultipleFiles(filesToUpload);
    onClose();
    console.log("false adding");

    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-full sm:max-w-xl bg-background-panel rounded-2xl border border-border shadow-xl p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display font-semibold text-lg text-foreground">
              Agregar material
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-background-hover"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <UploadDropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            hasDropError={!!dropError}
            dropError={dropError}
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

        <DialogFooter className="flex justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-transparent">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="h-9 rounded-xl px-4 text-sm text-foreground-secondary hover:text-foreground"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
