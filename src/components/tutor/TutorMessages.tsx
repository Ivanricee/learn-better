"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { ReferenceChip } from "@/components/ui/ReferenceChip";
import type { TutorMessage } from "@/lib/types";

interface TutorMessagesProps {
  messages: TutorMessage[];
  isThinking: boolean;
  onReferenceClick: () => void;
}

export function TutorMessages({
  messages,
  isThinking,
  onReferenceClick,
}: TutorMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`
              max-w-[85%] rounded-xl p-3
              ${
                msg.rol === "usuario"
                  ? "bg-[var(--primary-muted)]"
                  : "bg-[var(--background-elevated)]"
              }
            `}
          >
            {msg.rol === "tutor" && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[var(--tutor-muted)] flex items-center justify-center">
                  <Bot className="w-3 h-3 text-[var(--tutor)]" />
                </div>
                <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                  Tutor
                </span>
              </div>
            )}
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {msg.mensaje}
            </p>

            {/* Reference chips */}
            {msg.referencias && msg.referencias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {msg.referencias.map((ref, refIdx) => (
                  <ReferenceChip
                    key={refIdx}
                    reference={ref}
                    onClick={onReferenceClick}
                  />
                ))}
              </div>
            )}

            {msg.timestamp && (
              <p className="text-xs text-[var(--foreground-tertiary)] mt-2">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Thinking indicator */}
      {isThinking && (
        <div className="flex justify-start">
          <div className="bg-[var(--background-elevated)] rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[var(--tutor-muted)] flex items-center justify-center">
                <Bot className="w-3 h-3 text-[var(--tutor)]" />
              </div>
              <div className="flex gap-1">
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-tertiary)]" />
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-tertiary)]" />
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[var(--foreground-tertiary)]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
