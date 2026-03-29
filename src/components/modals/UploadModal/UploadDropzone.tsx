import { AlertCircle, CircleHelp, Upload } from "lucide-react";
import type { DropzoneState } from "react-dropzone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UploadDropzoneProps
  extends Pick<DropzoneState, "getRootProps" | "getInputProps" | "isDragActive"> {
  hasDropError: boolean;
  dropError: string | null;
  supportedTypesLabel: string;
  fileLimits: readonly (readonly [string, string])[];
  fileDurationLabel: string;
}

export function UploadDropzone({
  getRootProps,
  getInputProps,
  isDragActive,
  hasDropError,
  dropError,
  supportedTypesLabel,
  fileLimits,
  fileDurationLabel,
}: UploadDropzoneProps) {
  return (
    <>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--foreground-tertiary)]">
        <span>Límites por archivo</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="rounded-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Ver límites de tamaño y duración para archivos"
            >
              <CircleHelp className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs leading-relaxed">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              {fileLimits.map(([label, size]) => (
                <div key={label} className="contents">
                  <span className="text-[var(--foreground-secondary)]">{label}</span>
                  <span className="text-[var(--foreground)]">{size}</span>
                </div>
              ))}
            </div>
            <p className="mt-1">{fileDurationLabel}</p>
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
                className={`w-6 h-6 ${
                  isDragActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-tertiary)]"
                }`}
              />
            )}
          </div>
          <div className="text-center">
            {hasDropError ? (
              <p className="text-sm font-medium text-[var(--alert)]">{dropError}</p>
            ) : (
              <p className="text-sm text-[var(--foreground)]">
                {isDragActive
                  ? "Suelta los archivos aquí"
                  : "Arrastra archivos o haz clic para seleccionar"}
              </p>
            )}
            <p className="text-xs text-[var(--foreground-tertiary)] mt-1.5">
              {supportedTypesLabel}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
