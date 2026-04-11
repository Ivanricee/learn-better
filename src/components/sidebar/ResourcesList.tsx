"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Image,
  Link2,
  Music,
  Video,
  X,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Resource, ResourceType, ResourceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResourcesStore } from "@/lib/stores/zustand-store";

interface ResourcesListProps {
  categoryId: string; // UUID
}

function getResourceIcon(type: ResourceType) {
  switch (type) {
    case "youtube":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case "video":
      return <Video className="w-4 h-4" />;
    case "audio":
      return <Music className="w-4 h-4" />;
    case "pdf":
    case "text":
      return <FileText className="w-4 h-4" />;
    default:
      return <Link2 className="w-4 h-4" />;
  }
}

function getStatusIndicator(
  status: ResourceStatus,
  progress?: number,
  error_message?: string,
  step?: string,
) {
  switch (status) {
    case "queued":
    case "pending":
      return (
        <div className="flex items-center gap-1.5 text-[var(--foreground-tertiary)]">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">En cola</span>
        </div>
      );
    case "uploading":
    case "processing":
      const stepLabels: Record<string, string> = {
        downloading: "Descargando",
        converting: "Convirtiendo",
        transcribing: "Transcribiendo",
        extracting: "Extrayendo texto",
        vectorizing: "Vectorizando",
        generating_temario: "Generando temario",
        done: "Finalizando",
      };
      const stepLabel = step ? stepLabels[step] || "Procesando" : "Procesando";
      return (
        <div className="flex items-center gap-1.5 text-[var(--tutor)]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">{stepLabel}...</span>
        </div>
      );
    case "done":
      return (
        <div className="flex items-center gap-1.5 text-[var(--confirmation)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs">Listo</span>
        </div>
      );
    case "error":
      const errorContent = (
        <div className="flex items-center gap-1.5 text-[var(--alert)]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-xs">Error</span>
        </div>
      );

      if (error_message) {
        return (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>{errorContent}</Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 max-w-xs rounded-lg bg-[var(--background-panel)] px-3 py-2 text-xs text-[var(--foreground)] shadow-lg border border-[var(--border)]"
                  sideOffset={5}
                >
                  {error_message}
                  <Tooltip.Arrow className="fill-[var(--background-panel)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        );
      }

      return errorContent;
  }
}

function getTypeColor(type: ResourceType): string {
  switch (type) {
    case "youtube":
      return "bg-red-500/20 text-red-400";
    case "tiktok":
      return "bg-pink-500/20 text-pink-400";
    case "video":
      return "bg-purple-500/20 text-purple-400";
    case "audio":
      return "bg-blue-500/20 text-blue-400";
    case "pdf":
      return "bg-orange-500/20 text-orange-400";
    case "text":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-[var(--primary-muted)] text-[var(--primary)]";
  }
}

function ResourceItem({ resource }: { resource: Resource }) {
  const { removeResource } = useResourcesStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* console.log("� [ResourceItem] Renderizando resource:", {
    id: resource.id,
    name: resource.name,
    type: resource.type,
    status: resource.status,
    progress: resource.progress,
  });*/

  const isActive =
    resource.status === "uploading" || resource.status === "processing";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!resource.jobId) {
      removeResource(resource.id);
      setShowDeleteDialog(false);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${resource.jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        removeResource(resource.id);
        setShowDeleteDialog(false);
      } else {
        const errorText = await response.text();
        console.error("Error al eliminar recurso:", errorText);
        alert(`Error al eliminar: ${errorText}`);
      }
    } catch (error) {
      console.error("Error al eliminar recurso:", error);
      alert("Error al eliminar el recurso");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-3 py-2.5 rounded-lg
        ${isActive ? "bg-[var(--background-hover)] border border-[var(--border-subtle)]" : "hover:bg-[var(--background-hover)]"}
        transition-colors cursor-pointer group
      `}
    >
      {/* Type icon */}
      <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
        {getResourceIcon(resource.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] truncate">
          {resource.name}
        </p>
        {getStatusIndicator(
          resource.status,
          resource.progress,
          resource.error_message,
          resource.step,
        )}

        {/* Progress bar for active uploads */}
        {resource.status === "uploading" && (
          <div className="mt-2 h-1 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--tutor)] transition-all duration-300 rounded-full"
              style={{ width: `${resource.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Delete button - mostrar para todos los recursos */}
      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--foreground-tertiary)] hover:text-[var(--alert)] transition-all"
        title="Eliminar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar recurso?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el recurso "{resource.name}"
              y todos sus datos asociados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ResourcesList({ categoryId }: ResourcesListProps) {
  const allResources = useResourcesStore((state) => state.resources);

  // Filter resources for this category - memoized to avoid recalculating on every render
  const resources = useMemo(
    () => allResources.filter((r) => r.categoryId === categoryId),
    [allResources, categoryId],
  );

  // Sort: active first (uploading/processing), then pending/queued, then done/cancelled/error
  const sortedResources = useMemo(() => {
    const order: Record<ResourceStatus, number> = {
      uploading: 0,
      processing: 1,
      pending: 2,
      queued: 3,
      done: 4,
      cancelled: 5,
      error: 6,
    };
    return [...resources].sort((a, b) => order[a.status] - order[b.status]);
  }, [resources]);

  const activeCount = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.status === "uploading" ||
          r.status === "processing" ||
          r.status === "queued",
      ).length,
    [resources],
  );

  const completedCount = useMemo(
    () => resources.filter((r) => r.status === "done").length,
    [resources],
  );

  if (resources.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-[var(--background-hover)] mb-4">
          <FileText className="w-8 h-8 text-[var(--foreground-tertiary)]" />
        </div>
        <p className="text-sm text-[var(--foreground-secondary)] mb-1">
          Sin recursos todavia
        </p>
        <p className="text-xs text-[var(--foreground-tertiary)]">
          Agrega material usando el boton de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Stats */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 text-xs text-[var(--foreground-tertiary)]">
          {activeCount > 0 && (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-[var(--primary)]" />
              {activeCount} en proceso
            </span>
          )}
          <span>{completedCount} recursos</span>
        </div>
      </div>

      {/* Resource list */}
      <div className="p-2 space-y-1">
        {sortedResources.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
