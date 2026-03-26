"use client";

import { Plus } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category?: Category;
  isNewCard?: boolean;
  onClick: () => void;
}

export function CategoryCard({
  category,
  isNewCard,
  onClick,
}: CategoryCardProps) {
  if (isNewCard) {
    return (
      <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all duration-150 min-h-[140px]"
      >
        <Plus className="w-6 h-6 text-[var(--foreground-secondary)] group-hover:text-[var(--primary)] transition-colors duration-150" />
        <span className="text-sm text-[var(--foreground-secondary)] group-hover:text-[var(--primary)] transition-colors duration-150">
          Nueva categoría
        </span>
      </button>
    );
  }

  if (!category) return null;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] hover:border-[var(--border-hover)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-150 text-left min-h-[140px]"
    >
      <h3 className="font-display font-semibold text-base text-[var(--foreground)]">
        {category.nombre}
      </h3>

      <div className="flex-1" />

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="h-1 w-full rounded-full bg-[var(--muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${category.progreso}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--foreground-tertiary)]">
          <span>{category.progreso}% completado</span>
          <span>{category.temas} temas</span>
        </div>
      </div>
    </button>
  );
}
