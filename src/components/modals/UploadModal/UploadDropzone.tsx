import { AlertCircle, CircleHelp, Upload } from "lucide-react";
import type { DropzoneState } from "react-dropzone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FILE_SIZE_LABELS } from "../schemas/upload.schema";
import { SUPPORTED_TYPES_LABEL } from "./utils";

interface UploadDropzoneProps extends Pick<
  DropzoneState,
  "getRootProps" | "getInputProps" | "isDragActive"
> {
  hasDropError: boolean;
  dropError: string | null;
}
const FILE_DURATION_LABEL =
  "Audio y video: duración mínima recomendada de 2 horas.";
const FILE_LIMITS = [
  ["Audio", FILE_SIZE_LABELS.audio],
  ["Video", FILE_SIZE_LABELS.video],
  ["Imagen", FILE_SIZE_LABELS.image],
  ["PDF", FILE_SIZE_LABELS.pdf],
  ["Texto/MD", FILE_SIZE_LABELS.text],
] as const;
export function UploadDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  hasDropError,
  dropError,
}: UploadDropzoneProps) {
  return (
    <>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground-tertiary">
        <span>Límites por archivo</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="rounded-sm text-foreground-tertiary hover:text-foreground transition-colors"
              aria-label="Ver límites de tamaño y duración para archivos"
            >
              <CircleHelp className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs leading-relaxed">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              {FILE_LIMITS.map(([label, size]) => (
                <div key={label} className="contents">
                  <span className="text-foreground-secondary">{label}</span>
                  <span className="text-foreground">{size}</span>
                </div>
              ))}
            </div>
            <p className="mt-1">{FILE_DURATION_LABEL}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div>
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8
            border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 border-primary/40
            ${
              hasDropError
                ? "border-alert bg-alert/5"
                : isDragActive
                  ? "border-primary bg-primary-muted"
                  : "border-border hover:border-primary hover:bg-background-hover"
            }
          `}
        >
          <input {...getInputProps()} />
          <div
            className={`p-3 rounded-full ${
              hasDropError
                ? "bg-alert/15"
                : isDragActive
                  ? "bg-primary/20"
                  : "bg-background-hover"
            }`}
          >
            {hasDropError ? (
              <AlertCircle className="w-6 h-6 text-alert" />
            ) : (
              <Upload
                className={`w-6 h-6 ${
                  isDragActive ? "text-primary" : "text-foreground-tertiary"
                }`}
              />
            )}
          </div>
          <div className="text-center">
            {hasDropError ? (
              <p className="text-sm font-medium text-alert">{dropError}</p>
            ) : (
              <p className="text-sm text-foreground">
                {isDragActive
                  ? "Suelta los archivos aquí"
                  : "Arrastra archivos o haz clic para seleccionar"}
              </p>
            )}
            <p className="text-xs text-foreground-tertiary mt-1.5">
              {SUPPORTED_TYPES_LABEL}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
