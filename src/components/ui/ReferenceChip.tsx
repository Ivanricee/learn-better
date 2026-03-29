"use client";

import { FileText, Video, Music } from "lucide-react";
import type { TutorReference } from "@/lib/types";

interface ReferenceChipProps {
  reference: TutorReference;
  onClick: () => void;
}

const ICON_BY_TYPE: Record<TutorReference["tipo"], typeof FileText> = {
  pdf: FileText,
  video: Video,
  audio: Music,
};

export function ReferenceChip({ reference, onClick }: ReferenceChipProps) {
  const Icon = ICON_BY_TYPE[reference.tipo] ?? FileText;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-[var(--background-elevated)] border border-[var(--border-subtle)] text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-150"
    >
      <Icon className="w-3 h-3" />
      <span>{reference.label}</span>
    </button>
  );
}
