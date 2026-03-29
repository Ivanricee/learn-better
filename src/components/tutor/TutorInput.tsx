"use client";

import { useRef } from "react";
import { Send } from "lucide-react";

interface TutorInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function TutorInput({
  value,
  onChange,
  onSend,
  disabled,
}: TutorInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  return (
    <div className="p-3 border-t border-[var(--border-subtle)]">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre tu material..."
          rows={1}
          disabled={disabled}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--primary)] outline-none resize-none transition-colors duration-150 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="p-2 rounded-lg bg-[var(--tutor)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-150"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
