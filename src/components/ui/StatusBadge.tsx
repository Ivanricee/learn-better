"use client";

import type { ThemeStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ThemeStatus;
}

const statusConfig: Record<ThemeStatus, { label: string; className: string }> =
  {
    dominado: {
      label: "Dominado",
      className:
        "bg-[var(--confirmation-muted)] text-[var(--confirmation)] border-[var(--confirmation)]",
    },
    en_progreso: {
      label: "En progreso",
      className:
        "bg-[var(--secondary-muted)] text-[var(--secondary)] border-[var(--secondary)]",
    },
    hueco: {
      label: "Hueco detectado",
      className:
        "bg-[var(--alert-muted)] text-[var(--alert)] border-[var(--alert)]",
    },
    pendiente: {
      label: "Pendiente",
      className:
        "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
    },
  };

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function getStatusDotColor(status: ThemeStatus): string {
  switch (status) {
    case "dominado":
      return "bg-[var(--confirmation)]";
    case "en_progreso":
      return "bg-[var(--secondary)]";
    case "hueco":
      return "bg-[var(--alert)]";
    case "pendiente":
    default:
      return "bg-[var(--muted)]";
  }
}
