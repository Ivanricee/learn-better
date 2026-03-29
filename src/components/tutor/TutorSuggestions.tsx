"use client";

import { Lightbulb, Pin, Search } from "lucide-react";
import { tutorSuggestions } from "@/lib/mock-data";

interface TutorSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const icons = [Lightbulb, Pin, Search];

export function TutorSuggestions({ onSuggestionClick }: TutorSuggestionsProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {tutorSuggestions.map((suggestion, idx) => {
        const Icon = icons[idx];
        return (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="flex items-center gap-2 px-4 py-3 rounded-full text-sm text-left bg-[var(--background-elevated)] border border-[var(--border-subtle)] text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--foreground)] transition-all duration-150"
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{suggestion}</span>
          </button>
        );
      })}
    </div>
  );
}
