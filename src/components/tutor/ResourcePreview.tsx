"use client";

import { ArrowLeft, FileSearch } from "lucide-react";

interface ResourcePreviewProps {
  hasResource: boolean;
  onBackToTutor: () => void;
}

export function ResourcePreview({
  hasResource,
  onBackToTutor,
}: ResourcePreviewProps) {
  if (!hasResource) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <FileSearch className="w-12 h-12 text-[var(--foreground-tertiary)] mb-4" />
        <p className="text-sm text-[var(--foreground-secondary)]">
          Haz una pregunta al Tutor para ver las referencias aquí
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h3 className="font-display font-semibold text-sm text-[var(--foreground)]">
          PDF &quot;Estrategia cap.3&quot;
        </h3>
        <p className="text-xs text-[var(--foreground-tertiary)]">Página 8</p>
      </div>

      {/* Preview content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="p-4 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
            <span className="bg-[var(--secondary-muted)] px-1">
              Los componentes clave del análisis de mercado incluyen...
            </span>{" "}
            la evaluación sistemática de la demanda, la identificación de
            segmentos de clientes potenciales, el análisis de competidores
            directos e indirectos, y la comprensión de las tendencias
            macroeconómicas que afectan al sector.
          </p>
          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mt-4">
            Para realizar un análisis efectivo, es fundamental combinar datos
            cuantitativos (tamaño de mercado, tasas de crecimiento,
            participación de mercado) con insights cualitativos (motivaciones
            del cliente, percepciones de marca, barreras de entrada).
          </p>
        </div>
      </div>

      {/* Back button */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBackToTutor}
          className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Tutor
        </button>
      </div>
    </div>
  );
}
