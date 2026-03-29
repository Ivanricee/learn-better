"use client";

import { BookOpen, ArrowUpLeft } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <BookOpen className="w-16 h-16 text-[var(--foreground-tertiary)] mb-6" />
      <h2 className="font-display font-semibold text-lg text-[var(--foreground)] mb-2">
        Comienza subiendo material
      </h2>
      <p className="text-sm text-[var(--foreground-secondary)] max-w-sm mb-6">
        Sube material y presiona &quot;¿Qué me falta aprender?&quot; para
        generar tu temario personalizado
      </p>
      <div className="flex items-center gap-2 text-[var(--primary)]">
        <ArrowUpLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Usa el botón del sidebar</span>
      </div>
    </div>
  );
}
