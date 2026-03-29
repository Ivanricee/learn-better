"use client";

import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/stores/zustand-store";
import { temario, categories } from "@/lib/mock-data";
import { StatusBadge, getStatusDotColor } from "@/components/ui/StatusBadge";

interface CategoryProgressViewProps {
  categoryId: number;
}

export function CategoryProgressView({
  categoryId,
}: CategoryProgressViewProps) {
  const { setActivity } = useAppStore();
  const category = categories.find((c) => c.id === categoryId);
  const allThemes = [...temario.zona1, ...temario.zona2, ...temario.zona3];

  return (
    <div className="p-6 max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => setActivity("theme")}
        className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al tema
      </button>

      {/* Title */}
      <h1 className="font-display font-bold text-2xl text-[var(--foreground)] mb-6">
        Avance — {category?.nombre}
      </h1>

      {/* Progress overview */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${category?.progreso || 0}%` }}
            />
          </div>
          <span className="text-2xl font-display font-bold text-[var(--primary)]">
            {category?.progreso || 0}%
          </span>
        </div>
      </div>

      {/* Themes table */}
      <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--background-elevated)] text-left">
              <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                Tema
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                Estado
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                Progreso
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                Última actividad
              </th>
            </tr>
          </thead>
          <tbody>
            {allThemes.map((theme, idx) => {
              const progressValue =
                theme.estado === "dominado"
                  ? 100
                  : theme.estado === "en_progreso"
                    ? 65
                    : theme.estado === "hueco"
                      ? 30
                      : 0;

              return (
                <tr
                  key={theme.id}
                  className="border-t border-[var(--border-subtle)] hover:bg-[var(--background-elevated)] transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusDotColor(theme.estado)}`}
                      />
                      <span className="text-sm text-[var(--foreground)]">
                        {theme.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={theme.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--foreground-tertiary)]">
                        {progressValue}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-tertiary)]">
                    {theme.estado === "dominado"
                      ? "hace 1d"
                      : theme.estado === "en_progreso"
                        ? "hace 3h"
                        : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Roleplays section */}
      <div className="space-y-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)]">
          Roleplays realizados
        </h2>
        <div className="space-y-2">
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--foreground)]">
                Consultoría de entrada a mercado
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                Análisis de mercado · hace 2h
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--confirmation-muted)] text-[var(--confirmation)] border border-[var(--confirmation)]">
                7.8
              </span>
              <button className="text-xs text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150">
                Ver evaluación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
