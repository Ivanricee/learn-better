import type { KeyboardEvent } from "react";
import { AlertCircle, CircleHelp, Link2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UploadUrlFormValues } from "../schemas/upload.schema";

interface UploadUrlInputProps {
  register: UseFormRegister<UploadUrlFormValues>;
  urlErrors: FieldErrors<UploadUrlFormValues>;
  onSubmitUrl: () => void;
  onUrlKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  urlDurationLabel: string;
}

export function UploadUrlInput({
  register,
  urlErrors,
  onSubmitUrl,
  onUrlKeyDown,
  urlDurationLabel,
}: UploadUrlInputProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm text-[var(--foreground-secondary)]">
        <span>Pega un enlace de YouTube, Instagram o TikTok</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="rounded-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Ver duración mínima recomendada para enlaces"
            >
              <CircleHelp className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs leading-relaxed">
            {urlDurationLabel}
          </TooltipContent>
        </Tooltip>
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-tertiary)]" />
          <input
            type="text"
            {...register("url")}
            onKeyDown={onUrlKeyDown}
            placeholder="https://youtube.com/watch?v=..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-elevated border text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none transition-colors
              ${
                urlErrors.url
                  ? "border-[var(--alert)] focus:border-[var(--alert)]"
                  : "border-[var(--border)] focus:border-[var(--primary)]"
              }`}
          />
        </div>

        <Button
          variant="secondary"
          onClick={onSubmitUrl}
          className="h-10 rounded-xl px-4 text-sm"
        >
          <Link2 className="w-4 h-4" />
          Añadir enlace
        </Button>
      </div>

      {urlErrors.url && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--alert)]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {urlErrors.url.message}
        </p>
      )}
    </div>
  );
}
