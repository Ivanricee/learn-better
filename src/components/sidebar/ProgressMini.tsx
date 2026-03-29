"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface ProgressMiniProps {
  progress: number;
  completedActivities: number;
  lastSession: string;
  onViewDetail: () => void;
}

export function ProgressMini({
  progress,
  completedActivities,
  lastSession,
  onViewDetail,
}: ProgressMiniProps) {
  return (
    <div className="border-t border-[var(--border-subtle)]">
      <Accordion type="single" collapsible defaultValue="avance">
        <AccordionItem value="avance" className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:bg-[var(--background-elevated)] hover:no-underline">
            <span className="text-sm font-medium text-[var(--foreground-secondary)]">
              Avance
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 pb-4 space-y-3">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--primary)]">
                  {progress}%
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-1 text-xs text-[var(--foreground-tertiary)]">
                <p>{completedActivities} actividades completadas</p>
                <p>Última sesión: {lastSession}</p>
              </div>

              {/* View detail link */}
              <button
                onClick={onViewDetail}
                className="text-xs text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150"
              >
                Ver detalle →
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
