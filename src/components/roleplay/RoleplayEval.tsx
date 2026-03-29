"use client";

import { useState } from "react";
import { Check, ArrowUpRight, ChevronDown } from "lucide-react";
import { roleplayScenario, roleplayEvaluation } from "@/lib/mock-data";

interface RoleplayEvalProps {
  onBackToTheme: () => void;
  onRepeat: () => void;
}

export function RoleplayEval({ onBackToTheme, onRepeat }: RoleplayEvalProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Calculate the stroke dashoffset for the progress circle
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = roleplayEvaluation.calificacion / 10;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="font-display font-bold text-2xl text-[var(--foreground)] mb-2">
        Evaluación del escenario
      </h1>
      <p className="text-[var(--foreground-secondary)] mb-8">
        {roleplayScenario.titulo}
      </p>

      {/* Score circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 120 120"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-3xl text-[var(--primary)]">
              {roleplayEvaluation.calificacion.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-center text-[var(--foreground-secondary)] max-w-md">
          {roleplayEvaluation.resumen}
        </p>
      </div>

      {/* Feedback columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Positives */}
        <div className="p-5 rounded-xl bg-[var(--confirmation-muted)] border border-[var(--confirmation)]/30">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-[var(--confirmation)]" />
            <h3 className="font-display font-semibold text-[var(--confirmation)]">
              Lo que hiciste bien
            </h3>
          </div>
          <ul className="space-y-3">
            {roleplayEvaluation.positivos.map((item, idx) => (
              <li key={idx} className="text-sm text-[var(--foreground)]">
                <p className="mb-1">{item.punto}</p>
                <p className="text-xs text-[var(--foreground-tertiary)] font-mono">
                  [{item.fuente}]
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for improvement */}
        <div className="p-5 rounded-xl bg-[var(--secondary-muted)] border border-[var(--secondary)]/30">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-5 h-5 text-[var(--secondary)]" />
            <h3 className="font-display font-semibold text-[var(--secondary)]">
              Área de mejora
            </h3>
          </div>
          <ul className="space-y-3">
            {roleplayEvaluation.mejoras.map((item, idx) => (
              <li key={idx} className="text-sm text-[var(--foreground)]">
                <p className="mb-1">{item.punto}</p>
                <p className="text-xs text-[var(--foreground-tertiary)] font-mono">
                  [{item.fuente}]
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transcript accordion */}
      <div className="mb-8 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--background-elevated)] hover:bg-[var(--card)] transition-colors duration-150"
        >
          <span className="text-sm font-medium text-[var(--foreground-secondary)]">
            Ver transcripción completa
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[var(--foreground-tertiary)] transition-transform duration-250 ${showTranscript ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-250 ${
            showTranscript ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="p-4 bg-[var(--card)] border-t border-[var(--border-subtle)]">
            <div className="space-y-3 text-sm">
              <p className="text-[var(--foreground-secondary)]">
                <span className="font-medium text-[var(--secondary)]">
                  Carlos:
                </span>{" "}
                Mira, necesito que seas directo conmigo...
              </p>
              <p className="text-[var(--foreground-secondary)]">
                <span className="font-medium text-[var(--primary)]">Tú:</span>{" "}
                [Tus respuestas durante el roleplay aparecerían aquí]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onBackToTheme}
          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)] transition-all duration-150"
        >
          ← Volver al tema
        </button>
        <button
          onClick={onRepeat}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] transition-colors duration-150"
        >
          Repetir escenario
        </button>
      </div>
    </div>
  );
}
