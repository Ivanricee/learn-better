"use client";

import { useAppStore } from "@/lib/stores/zustand-store";
import { ViewType } from "@/lib/types";

const navItems: { label: string; view: ViewType }[] = [
  { label: "Categorías", view: "home" },
  { label: "Progreso", view: "progress" },
  { label: "Ajustes", view: "settings" },
];

export function Topbar() {
  const { currentView, setView, resetToHome, currentCategoryId } =
    useAppStore();

  const handleLogoClick = () => {
    resetToHome();
  };

  const handleNavClick = (view: ViewType) => {
    if (currentCategoryId) {
      resetToHome();
    }
    setView(view);
  };

  // If we're in a category view, don't show the topbar navigation
  if (currentCategoryId) {
    return null;
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-[var(--background-panel)] border-b border-[var(--border-subtle)]">
      <button
        onClick={handleLogoClick}
        className="font-display font-bold text-xl text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-150"
      >
        Trainery
      </button>

      <nav className="flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => handleNavClick(item.view)}
            className={`text-sm font-medium transition-colors duration-150 ${
              currentView === item.view && !currentCategoryId
                ? "text-[var(--primary)]"
                : "text-[var(--foreground-secondary)] hover:text-[var(--primary)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
