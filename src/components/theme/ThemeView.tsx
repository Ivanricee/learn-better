"use client";

import { BookOpen, Layers, HelpCircle, Theater } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { themeDetails, temario } from "@/lib/mock-data";
import type { ThemeDetail } from "@/lib/types";

interface ThemeViewProps {
  themeId: string;
  onStartActivity: (activity: "flashcards" | "quiz" | "roleplay") => void;
}

const activities = [
  {
    id: "flashcards" as const,
    name: "Flashcards",
    icon: Layers,
    count: "12 tarjetas",
    accentClass: "text-[var(--primary)] border-[var(--primary)]",
  },
  {
    id: "quiz" as const,
    name: "Quiz",
    icon: HelpCircle,
    count: "8 preguntas",
    accentClass: "text-[var(--secondary)] border-[var(--secondary)]",
  },
  {
    id: "roleplay" as const,
    name: "Roleplay",
    icon: Theater,
    count: "1 escenario",
    accentClass: "text-[var(--confirmation)] border-[var(--confirmation)]",
  },
];

export function ThemeView({ themeId, onStartActivity }: ThemeViewProps) {
  const detail = themeDetails[themeId];
  const theme = [...temario.zona1, ...temario.zona2, ...temario.zona3].find(
    (t) => t.id === themeId,
  );

  if (!detail || !theme) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="w-12 h-12 text-[var(--foreground-tertiary)] mb-4" />
        <p className="text-[var(--foreground-secondary)]">
          Selecciona un tema del sidebar para ver su contenido
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl text-[var(--foreground)]">
            {detail.tema}
          </h1>
          <StatusBadge status={detail.estado} />
        </div>
        <div className="h-px bg-[var(--border-subtle)]" />
      </div>

      {/* Summary */}
      <div className="p-6 rounded-xl bg-[var(--background-elevated)] border border-[var(--border-subtle)]">
        <p className="text-xs uppercase tracking-wider font-display font-semibold text-[var(--foreground-tertiary)] mb-3">
          Resumen
        </p>
        <p className="text-[var(--foreground)] leading-relaxed">
          {detail.resumen}
        </p>

        {/* Sources */}
        <div className="mt-4 flex items-start gap-2 text-xs text-[var(--foreground-tertiary)]">
          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Basado en: {detail.fuentes.join(" · ")}</span>
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider font-display font-semibold text-[var(--foreground-tertiary)]">
          Actividades
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <button
                key={activity.id}
                onClick={() => onStartActivity(activity.id)}
                className={`
                  group flex flex-col items-center gap-3 p-6 rounded-xl
                  bg-[var(--card)] border border-[var(--border-subtle)]
                  hover:border-current transition-all duration-150
                  ${activity.accentClass}
                `}
              >
                <Icon className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-display font-semibold text-[var(--foreground)] group-hover:text-current transition-colors duration-150">
                    {activity.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">
                    {activity.count}
                  </p>
                </div>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  Comenzar →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
