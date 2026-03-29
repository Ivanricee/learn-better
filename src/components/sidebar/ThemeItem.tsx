"use client";

import type { Theme } from "@/lib/types";
import { getStatusDotColor } from "@/components/ui/StatusBadge";

interface ThemeItemProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

export function ThemeItem({ theme, isActive, onClick }: ThemeItemProps) {
  const dotColor = getStatusDotColor(theme.estado);

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-left
        transition-all duration-150 rounded-r-lg
        ${
          isActive
            ? "border-l-2 border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--foreground)]"
            : "border-l-2 border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]"
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-sm truncate">{theme.nombre}</span>
      </div>

      {theme.pendientes !== undefined && theme.pendientes > 0 && (
        <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--background-elevated)] text-[var(--foreground-tertiary)]">
          {theme.pendientes}
        </span>
      )}
    </button>
  );
}
