"use client";

import { ArrowLeft, Theater, Target, Clock } from "lucide-react";
import { roleplayScenario } from "@/lib/mock-data";

interface RoleplayIntroProps {
  onStart: () => void;
  onBack: () => void;
}

export function RoleplayIntro({ onStart, onBack }: RoleplayIntroProps) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al tema
      </button>

      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--confirmation-muted)] text-[var(--confirmation)] border border-[var(--confirmation)]">
          <Theater className="w-3.5 h-3.5" />
          Roleplay
        </span>
      </div>

      {/* Title */}
      <h1 className="font-display font-bold text-2xl text-[var(--foreground)] mb-4">
        {roleplayScenario.titulo}
      </h1>

      {/* Description */}
      <div className="p-5 rounded-xl bg-[var(--background-elevated)] border border-[var(--border-subtle)] mb-6">
        <p className="text-[var(--foreground)] leading-relaxed">
          {roleplayScenario.descripcion}
        </p>
      </div>

      {/* Objectives */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)] mb-3">
          <Target className="w-4 h-4" />
          Objetivos a evaluar
        </h2>
        <ul className="space-y-2">
          {roleplayScenario.objetivos.map((objetivo, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--card)] border border-[var(--border-subtle)]"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-medium flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="text-sm text-[var(--foreground)]">
                {objetivo}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Time estimate */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-tertiary)] mb-8">
        <Clock className="w-4 h-4" />
        <span>~{roleplayScenario.tiempo_estimado} minutos</span>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl text-base font-medium bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] transition-colors duration-150"
      >
        Comenzar escenario →
      </button>
    </div>
  );
}
