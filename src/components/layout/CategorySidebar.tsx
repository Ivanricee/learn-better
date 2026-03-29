"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Check,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore, useResourcesStore } from "@/lib/stores/zustand-store";
import { ZoneAccordion } from "@/components/sidebar/ZoneAccordion";
import { ProgressMini } from "@/components/sidebar/ProgressMini";
import { ResourcesList } from "@/components/sidebar/ResourcesList";
import { temario, categories } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface CategorySidebarProps {
  categoryId: number;
  onDiagnosticClick: () => void;
  onAddMaterial: () => void;
}

export function CategorySidebar({
  categoryId,
  onDiagnosticClick,
  onAddMaterial,
}: CategorySidebarProps) {
  const router = useRouter();
  const {
    currentThemeId,
    setTheme,
    resetToHome,
    setActivity,
    temarioGenerated,
    leftPanelTab,
    setLeftPanelTab,
  } = useAppStore();

  const category = categories.find((c) => c.id === categoryId);

  // Get all resources and compute active count with memoization
  const allResources = useResourcesStore((state) => state.resources);
  const activeResourceCount = useMemo(
    () =>
      allResources.filter(
        (r) =>
          r.categoryId === categoryId &&
          (r.status === "uploading" ||
            r.status === "processing" ||
            r.status === "queued"),
      ).length,
    [allResources, categoryId],
  );

  const handleBackClick = () => {
    resetToHome();
    router.push("/");
  };

  const handleThemeClick = (themeId: string) => {
    setTheme(themeId);
    setActivity("theme");
  };

  const handleViewDetail = () => {
    setActivity("progress");
  };

  return (
    <Sidebar collapsible="none">
      <SidebarHeader>
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Inicio
        </button>

        {/* Category name */}
        <div className="px-4 pb-2">
          <h1 className="font-display font-semibold text-lg text-[var(--foreground)]">
            {category?.nombre || "Nueva categoria"}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="px-4 space-y-2 pb-4">
          <button
            onClick={onAddMaterial}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-muted)] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Agregar material
          </button>

          {temarioGenerated ? (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--confirmation)]">
              <Check className="w-4 h-4" />
              Temario generado
            </div>
          ) : (
            <button
              onClick={onDiagnosticClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--primary)] bg-[var(--primary-muted)] text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all duration-150"
            >
              <Sparkles className="w-4 h-4" />
              Que me falta aprender?
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Tabs */}
        <Tabs
          value={leftPanelTab}
          onValueChange={(v) => setLeftPanelTab(v as "temario" | "recursos")}
          className="flex-1 flex flex-col min-h-0 gap-0"
        >
          <TabsList
            variant="line"
            className="w-full rounded-none border-b border-[var(--border-subtle)] h-10 px-0 gap-0"
          >
            <TabsTrigger
              value="temario"
              className="flex-1 gap-2 rounded-none h-full data-[state=active]:text-[var(--primary)] data-[state=active]:after:bg-[var(--primary)]"
            >
              <BookOpen className="w-4 h-4" />
              Temario
            </TabsTrigger>
            <TabsTrigger
              value="recursos"
              className="flex-1 gap-2 rounded-none h-full relative data-[state=active]:text-[var(--primary)] data-[state=active]:after:bg-[var(--primary)]"
            >
              <FolderOpen className="w-4 h-4" />
              Recursos
              {activeResourceCount > 0 && (
                <span className="absolute top-1.5 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-[var(--background)]">
                  {activeResourceCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temario" className="flex-1 overflow-y-auto mt-0">
            <ZoneAccordion
              title="Prerequisitos"
              themes={temario.zona1}
              variant="prerequisites"
              activeThemeId={currentThemeId}
              onThemeClick={handleThemeClick}
            />
            <ZoneAccordion
              title="Tu material"
              themes={temario.zona2}
              variant="material"
              defaultOpen={true}
              activeThemeId={currentThemeId}
              onThemeClick={handleThemeClick}
            />
            <ZoneAccordion
              title="Siguientes pasos"
              themes={temario.zona3}
              variant="next"
              activeThemeId={currentThemeId}
              onThemeClick={handleThemeClick}
            />
          </TabsContent>

          <TabsContent value="recursos" className="flex-1 overflow-y-auto mt-0">
            <ResourcesList categoryId={categoryId} />
          </TabsContent>
        </Tabs>
      </SidebarContent>

      <SidebarFooter>
        <ProgressMini
          progress={category?.progreso || 0}
          completedActivities={12}
          lastSession="hace 2h"
          onViewDetail={handleViewDetail}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
