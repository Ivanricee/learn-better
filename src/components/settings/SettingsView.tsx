"use client";

import { useAppStore } from "@/src/lib/stores/zustand-store";
import { ArrowLeft, Link2Off, FileText, FileCode, User } from "lucide-react";

const integrations = [
  { name: "Notion", icon: "📝", status: "Desconectado" },
  { name: "WhatsApp", icon: "💬", status: "Desconectado" },
  { name: "Google Calendar", icon: "📅", status: "Desconectado" },
];

export function SettingsView() {
  const { setView } = useAppStore();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
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
        Ajustes
      </h1>

      {/* Integrations */}
      <section className="mb-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-4">
          Integraciones
        </h2>
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{integration.icon}</span>
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {integration.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[var(--foreground-tertiary)]">
                    <Link2Off className="w-3 h-3" />
                    <span>{integration.status}</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-150">
                Conectar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="mb-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-4">
          Exportación
        </h2>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--foreground-secondary)] mb-3">
            Formato de exportación:
          </p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]">
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)] transition-colors duration-150">
              <FileCode className="w-4 h-4" />
              Markdown
            </button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground-tertiary)] mb-4">
          Cuenta
        </h2>
        <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] text-center">
          <div className="p-3 rounded-full bg-[var(--background-elevated)] w-fit mx-auto mb-4">
            <User className="w-6 h-6 text-[var(--foreground-tertiary)]" />
          </div>
          <p className="text-[var(--foreground-secondary)] mb-1">
            Disponible próximamente
          </p>
          <p className="text-xs text-[var(--foreground-tertiary)]">
            Sincroniza tu progreso entre dispositivos
          </p>
        </div>
      </section>
    </div>
  );
}
