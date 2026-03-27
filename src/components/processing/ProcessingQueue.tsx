"use client";

import { useEffect } from "react";
import {
  Check,
  RotateCw,
  Circle,
  AlertCircle,
  FileText,
  Video,
  Music,
  Globe,
  FileSpreadsheet,
} from "lucide-react";

import type { ProcessingItem, FileType } from "@/lib/types";
import { useProcessingStore } from "@/lib/stores/zustand-store";

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "pdf":
    case "pdf-scanned":
      return FileText;
    case "video":
    case "url":
      return Video;
    case "audio":
      return Music;
    case "doc":
    default:
      return FileSpreadsheet;
  }
};

function ProcessingItemCard({ item }: { item: ProcessingItem }) {
  const { advanceStep, markDone, markError, removeFromQueue } =
    useProcessingStore();

  useEffect(() => {
    if (item.status !== "processing") return;

    const delays =
      item.type === "pdf-scanned"
        ? [0, 1200, 3500, 5500, 7000, 8500]
        : item.type === "video" || item.type === "url" || item.type === "audio"
          ? [0, 1200, 3800, 5500, 7000]
          : [0, 1200, 2800, 4500, 6000];

    const currentDelay = delays[item.currentStep + 1];
    if (currentDelay === undefined) return;

    // 10% chance of error on any step after the first
    if (item.currentStep > 0 && Math.random() < 0.1) {
      const errorTimeout = setTimeout(() => {
        markError(item.id);
      }, 1000);
      return () => clearTimeout(errorTimeout);
    }

    const timeout = setTimeout(
      () => {
        if (item.currentStep < item.steps.length - 1) {
          advanceStep(item.id);
        } else {
          markDone(item.id);
        }
      },
      currentDelay - (delays[item.currentStep] || 0),
    );

    return () => clearTimeout(timeout);
  }, [
    item.currentStep,
    item.status,
    item.id,
    item.steps.length,
    item.type,
    advanceStep,
    markDone,
    markError,
  ]);

  // Auto-remove after done
  useEffect(() => {
    if (item.status === "done") {
      const timeout = setTimeout(() => {
        removeFromQueue(item.id);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [item.status, item.id, removeFromQueue]);

  const FileIcon = getFileIcon(item.type);

  return (
    <div
      className={`
      p-4 rounded-xl border bg-[var(--card)]
      transition-opacity duration-300
      ${item.status === "done" ? "border-[var(--confirmation)]" : "border-[var(--border)]"}
    `}
    >
      <div className="flex items-center gap-2 mb-3">
        <FileIcon className="w-4 h-4 text-[var(--foreground-secondary)]" />
        <span className="text-sm font-medium text-[var(--foreground)] truncate">
          {item.filename}
        </span>
      </div>

      <div className="h-px bg-[var(--border)] mb-3" />

      <div className="space-y-2">
        {item.steps.map((step, index) => {
          const isCompleted =
            index < item.currentStep || item.status === "done";
          const isCurrent =
            index === item.currentStep && item.status === "processing";
          const isError = index === item.currentStep && item.status === "error";
          const isPending = index > item.currentStep;

          return (
            <div key={index} className="flex items-center gap-2">
              {isCompleted && (
                <Check
                  className={`w-4 h-4 flex-shrink-0 ${
                    item.status === "done"
                      ? "text-[var(--confirmation)]"
                      : "text-[var(--foreground-secondary)]"
                  }`}
                />
              )}
              {isCurrent && (
                <RotateCw className="w-4 h-4 flex-shrink-0 text-[var(--primary)] animate-spin" />
              )}
              {isError && (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--alert)]" />
              )}
              {isPending && !isError && (
                <Circle className="w-4 h-4 flex-shrink-0 text-[var(--foreground-tertiary)]" />
              )}
              <span
                className={`text-xs ${
                  isCompleted
                    ? item.status === "done"
                      ? "text-[var(--confirmation)]"
                      : "text-[var(--foreground-secondary)]"
                    : isCurrent
                      ? "text-[var(--foreground)]"
                      : isError
                        ? "text-[var(--alert)]"
                        : "text-[var(--foreground-tertiary)]"
                }`}
              >
                {isError ? `${step} — reintentar` : step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProcessingQueue() {
  const { queue } = useProcessingStore();

  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-3">
      {queue.map((item) => (
        <ProcessingItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
