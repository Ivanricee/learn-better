"use client";

import { ArrowLeft, Folder, BookOpen, Theater, Flame, Eye } from "lucide-react";

import { globalProgress } from "@/lib/mock-data";
import { useAppStore } from "@/lib/stores/zustand-store";

function getCalificationColor(cal: number): string {
  if (cal >= 8)
    return "bg-[var(--confirmation-muted)] text-[var(--confirmation)] border-[var(--confirmation)]";
  if (cal >= 6)
    return "bg-[var(--secondary-muted)] text-[var(--secondary)] border-[var(--secondary)]";
  return "bg-[var(--alert-muted)] text-[var(--alert)] border-[var(--alert)]";
}

export function ProgressGlobal() {
  const { setView } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => setView("home")}
        className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Categorías
      </button>

      {/* Title */}
      <h1 className="font-display font-bold text-2xl text-[var(--foreground)] mb-8">
        Progreso general
      </h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary-muted)]">
              <Folder className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-[var(--foreground)]">
                {globalProgress.stats.categorias}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                Categorías
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--secondary-muted)]">
              <BookOpen className="w-4 h-4 text-[var(--secondary)]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-[var(--foreground)]">
                {globalProgress.stats.temas}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)]">Temas</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--confirmation-muted)]">
              <Theater className="w-4 h-4 text-[var(--confirmation)]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-[var(--foreground)]">
                {globalProgress.stats.roleplays}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                Roleplays
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--alert-muted)]">
              <Flame className="w-4 h-4 text-[var(--alert)]" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-[var(--foreground)]">
                {globalProgress.stats.racha_dias}
              </p>
              <p className="text-xs text-[var(--foreground-tertiary)]">
                Días de racha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories list */}
      <div className="space-y-4 mb-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)]">
          Categorías
        </h2>
        <div className="space-y-3">
          {globalProgress.categorias.map((cat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-[var(--foreground)]">
                  {cat.nombre}
                </h3>
                <button className="flex items-center gap-1 text-xs text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150">
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${cat.progreso}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--primary)]">
                  {cat.progreso}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--foreground-tertiary)]">
                <span>Último tema: {cat.ultimo_tema}</span>
                <span>{cat.ultima_sesion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent roleplays */}
      <div className="space-y-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)]">
          Roleplays recientes
        </h2>
        <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--background-elevated)] text-left">
                <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                  Tema
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                  Categoría
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                  Calificación
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]">
                  Fecha
                </th>
                <th className="px-4 py-3 text-xs font-medium text-[var(--foreground-tertiary)]"></th>
              </tr>
            </thead>
            <tbody>
              {globalProgress.roleplays_recientes.map((roleplay, idx) => (
                <tr
                  key={idx}
                  className="border-t border-[var(--border-subtle)] hover:bg-[var(--background-elevated)] transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {roleplay.tema}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
                    {roleplay.categoria}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCalificationColor(roleplay.calificacion)}`}
                    >
                      {roleplay.calificacion.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground-tertiary)]">
                    {roleplay.fecha}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150">
                      Ver evaluación
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
