"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { DropZone } from "@/components/home/DropZone";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProcessingQueue } from "@/components/processing/ProcessingQueue";
import { CategorizationModal } from "@/components/modals/CategorizationModal";
import { ProgressGlobal } from "@/components/progress/ProgressGlobal";
import { SettingsView } from "../components/settings/SettingsView";
import {
  useAppStore,
  useCategoryStore,
  useProcessingStore,
} from "@/lib/stores/zustand-store";
import { getProcessingSteps } from "@/lib/mock-data";
import type { FileType } from "@/lib/types";

function getFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (file.type.includes("pdf")) {
    // Randomly decide if it's a scanned PDF (20% chance)
    return Math.random() < 0.2 ? "pdf-scanned" : "pdf";
  }
  if (file.type.includes("audio") || ext === "mp3" || ext === "wav")
    return "audio";
  if (file.type.includes("video") || ext === "mp4" || ext === "webm")
    return "video";
  return "doc";
}

function getUrlType(url: string): FileType {
  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("tiktok.com")
  ) {
    return "url";
  }
  return "url";
}

export default function Home() {
  const router = useRouter();
  const { currentView, setCategory } = useAppStore();
  const { addToQueue } = useProcessingStore();
  const categories = useCategoryStore((state) => state.categories);
  const createCategory = useCategoryStore((state) => state.createCategory);

  const [showCategorizationModal, setShowCategorizationModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    name: string;
    type: FileType;
  } | null>(null);

  const handleFileAccepted = (file: File) => {
    const fileType = getFileType(file);
    setPendingFile({ name: file.name, type: fileType });
    setShowCategorizationModal(true);
  };

  const handleUrlSubmit = (url: string) => {
    const urlType = getUrlType(url);
    // Extract a filename from URL
    const urlObj = new URL(url);
    const filename =
      urlObj.hostname.replace("www.", "") +
      " - " +
      (urlObj.pathname.split("/").pop() || "video");
    setPendingFile({ name: filename, type: urlType });
    setShowCategorizationModal(true);
  };

  const handleCategorizationConfirm = (
    categoryId: string | null,
    newCategoryName?: string,
  ) => {
    if (categoryId === null && newCategoryName) {
      createCategory({ nombre: newCategoryName });
    }

    if (pendingFile) {
      // Add to processing queue
      addToQueue({
        id: Math.random().toString(36).substring(7),
        filename: pendingFile.name,
        type: pendingFile.type,
        steps: getProcessingSteps(pendingFile.type),
      });
    }
    setPendingFile(null);
    setShowCategorizationModal(false);
  };

  const handleCategoryClick = (id: string) => {
    setCategory(id);
    router.push(`/category/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar />

      <main className="flex-1">
        {currentView === "home" && (
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <CategoryGrid
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />
          </div>
        )}

        {currentView === "progress" && <ProgressGlobal />}
        {currentView === "settings" && <SettingsView />}
      </main>

      {/* Processing Queue */}
      <ProcessingQueue />

      {/* Categorization Modal */}
      {pendingFile && (
        <CategorizationModal
          isOpen={showCategorizationModal}
          onClose={() => {
            setShowCategorizationModal(false);
            setPendingFile(null);
          }}
          onConfirm={handleCategorizationConfirm}
          filename={pendingFile.name}
          fileType={pendingFile.type}
        />
      )}
    </div>
  );
}
