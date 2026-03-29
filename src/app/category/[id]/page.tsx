"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAppStore } from "@/lib/stores/zustand-store";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { SidebarResizer } from "@/components/layout/SidebarResizer";
import { RightPanel } from "@/components/layout/RightPanel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeView } from "@/components/theme/ThemeView";
import { EmptyState } from "@/components/theme/EmptyState";
import { RoleplayIntro } from "@/components/roleplay/RoleplayIntro";
import { RoleplayChat } from "@/components/roleplay/RoleplayChat";
import { RoleplayEval } from "@/components/roleplay/RoleplayEval";
import { CategoryProgressView } from "@/components/progress/CategoryProgressView";

import { DiagnosticModal } from "@/components/modals/DiagnosticModal";
import { UploadModal } from "@/components/modals/UploadModal";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);

  const {
    currentThemeId,
    currentActivity,
    setActivity,
    setTheme,
    rightPanelOpen,
    toggleRightPanel,
    setTemarioGenerated,
    temarioGenerated,
    sidebarWidth,
  } = useAppStore();

  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [roleplayPhase, setRoleplayPhase] = useState<"intro" | "chat" | "eval">(
    "intro",
  );

  // Initialize with first theme selected
  useEffect(() => {
    if (!currentThemeId) {
      setTheme("t2"); // Default to "Analisis de mercado"
    }
  }, [currentThemeId, setTheme]);

  const handleDiagnosticClick = () => {
    setShowDiagnosticModal(true);
  };

  const handleDiagnosticComplete = () => {
    setShowDiagnosticModal(false);
    setTemarioGenerated(true);
  };

  const handleAddMaterial = () => {
    setShowUploadModal(true);
  };

  const handleStartActivity = (
    activity: "flashcards" | "quiz" | "roleplay",
  ) => {
    if (activity === "roleplay") {
      setRoleplayPhase("intro");
    }
    setActivity(activity);
  };

  const handleStartRoleplay = () => {
    setRoleplayPhase("chat");
  };

  const handleEndRoleplay = () => {
    setRoleplayPhase("eval");
    setActivity("roleplay-eval");
  };

  const handleBackToTheme = () => {
    setActivity("theme");
    setRoleplayPhase("intro");
  };

  const handleRepeatRoleplay = () => {
    setRoleplayPhase("intro");
    setActivity("roleplay");
  };

  const renderCentralContent = () => {
    // Progress view
    if (currentActivity === "progress") {
      return <CategoryProgressView categoryId={categoryId} />;
    }

    // Roleplay flow
    if (currentActivity === "roleplay") {
      if (roleplayPhase === "intro") {
        return (
          <RoleplayIntro
            onStart={handleStartRoleplay}
            onBack={handleBackToTheme}
          />
        );
      }
      if (roleplayPhase === "chat") {
        return (
          <RoleplayChat onEnd={handleEndRoleplay} onBack={handleBackToTheme} />
        );
      }
    }

    if (currentActivity === "roleplay-eval") {
      return (
        <RoleplayEval
          onBackToTheme={handleBackToTheme}
          onRepeat={handleRepeatRoleplay}
        />
      );
    }

    // Theme view (default)
    if (currentThemeId) {
      return (
        <ThemeView
          themeId={currentThemeId}
          onStartActivity={handleStartActivity}
        />
      );
    }

    // Empty state
    if (!temarioGenerated) {
      return <EmptyState />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BookOpen className="w-12 h-12 text-[var(--foreground-tertiary)] mb-4" />
        <p className="text-[var(--foreground-secondary)]">
          Selecciona un tema del sidebar para comenzar
        </p>
      </div>
    );
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      {/* Left sidebar */}
      <CategorySidebar
        categoryId={categoryId}
        onDiagnosticClick={handleDiagnosticClick}
        onAddMaterial={handleAddMaterial}
      />

      {/* Resizer */}
      <SidebarResizer />

      {/* Center: top bar + scrollable content, animated margin when panel opens */}
      <SidebarInset
        className={`transition-[margin-right] duration-300 ease-in-out ${
          rightPanelOpen ? "mr-[380px]" : ""
        }`}
      >
        {/* Top bar with Tutor toggle — hidden when panel is open */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
          <button
            onClick={toggleRightPanel}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              border transition-all duration-300
              ${
                rightPanelOpen
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--tutor)] hover:text-[var(--tutor)]"
              }
            `}
          >
            <BookOpen className="w-4 h-4" />
            Tutor
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{renderCentralContent()}</div>
      </SidebarInset>

      {/* Right panel — always mounted, slides in/out via translateX */}
      <RightPanel
        categoryId={categoryId}
        onClose={toggleRightPanel}
        isOpen={rightPanelOpen}
        isInRoleplay={
          currentActivity === "roleplay" && roleplayPhase === "chat"
        }
      />

      {/* Modals */}
      <DiagnosticModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        onComplete={handleDiagnosticComplete}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        categoryId={categoryId}
      />
    </SidebarProvider>
  );
}
