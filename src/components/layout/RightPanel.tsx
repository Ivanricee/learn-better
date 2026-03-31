"use client";

import { useState, useRef, useEffect } from "react";
import { X, History, AlertTriangle, MessageSquare } from "lucide-react";
import { useAppStore, useTutorStore } from "@/lib/stores/zustand-store";
import { TutorMessages } from "@/components/tutor/TutorMessages";
import { TutorInput } from "@/components/tutor/TutorInput";
import { TutorSuggestions } from "@/components/tutor/TutorSuggestions";
import { ResourcePreview } from "@/components/tutor/ResourcePreview";
import { tutorResponses } from "@/lib/mock-data";
import type { TutorMessage } from "@/lib/types";

interface RightPanelProps {
  categoryId: string; // UUID
  onClose: () => void;
  isInRoleplay?: boolean;
  isOpen?: boolean;
}

export function RightPanel({
  categoryId,
  onClose,
  isInRoleplay,
  isOpen = true,
}: RightPanelProps) {
  const { rightPanelTab, setRightPanelTab } = useAppStore();
  const {
    conversations,
    addMessage,
    tutorConsultsDuringRoleplay,
    incrementRoleplayConsults,
  } = useTutorStore();

  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [hasResource, setHasResource] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = conversations[categoryId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: TutorMessage = {
      rol: "usuario",
      mensaje: inputValue.trim(),
      timestamp: new Date(),
    };
    addMessage(categoryId, userMessage);
    setInputValue("");

    // Track consults during roleplay
    if (isInRoleplay) {
      incrementRoleplayConsults();
    }

    // Simulate thinking and response
    setIsThinking(true);
    setTimeout(
      () => {
        setIsThinking(false);

        // Get random mock response
        const randomResponse =
          tutorResponses[Math.floor(Math.random() * tutorResponses.length)];
        const tutorMessage: TutorMessage = {
          ...randomResponse,
          timestamp: new Date(),
        };
        addMessage(categoryId, tutorMessage);
      },
      800 + Math.random() * 1500,
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Auto-send after a brief delay
    setTimeout(() => {
      const userMessage: TutorMessage = {
        rol: "usuario",
        mensaje: suggestion,
        timestamp: new Date(),
      };
      addMessage(categoryId, userMessage);
      setInputValue("");

      // Simulate response
      setIsThinking(true);
      setTimeout(
        () => {
          setIsThinking(false);
          const randomResponse =
            tutorResponses[Math.floor(Math.random() * tutorResponses.length)];
          const tutorMessage: TutorMessage = {
            ...randomResponse,
            timestamp: new Date(),
          };
          addMessage(categoryId, tutorMessage);
        },
        800 + Math.random() * 1500,
      );
    }, 100);
  };

  const handleReferenceClick = () => {
    setHasResource(true);
    setRightPanelTab("resource");
  };

  const handleBackToTutor = () => {
    setRightPanelTab("tutor");
  };

  return (
    <aside
      className={`fixed right-0 top-0 h-screen w-[380px] min-w-[380px] max-w-[380px] bg-[var(--background-panel)] border-l border-[var(--border-subtle)] flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRightPanelTab("tutor")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors duration-150 border-b-2 ${
              rightPanelTab === "tutor"
                ? "text-[var(--foreground)] border-[var(--primary)]"
                : "text-[var(--foreground-tertiary)] border-transparent hover:text-[var(--foreground-secondary)]"
            }`}
          >
            Tutor
          </button>
          <button
            onClick={() => setRightPanelTab("resource")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors duration-150 border-b-2 ${
              rightPanelTab === "resource"
                ? "text-[var(--foreground)] border-[var(--primary)]"
                : "text-[var(--foreground-tertiary)] border-transparent hover:text-[var(--foreground-secondary)]"
            }`}
          >
            Recurso
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors duration-150"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Roleplay warning banner */}
      {isInRoleplay && rightPanelTab === "tutor" && (
        <div className="px-4 py-2 bg-[var(--secondary-muted)] border-b border-[var(--secondary)]/30">
          <div className="flex items-center gap-2 text-xs text-[var(--secondary)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Consultas registradas: {tutorConsultsDuringRoleplay}</span>
          </div>
        </div>
      )}

      {rightPanelTab === "tutor" ? (
        <>
          {/* Conversation header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
            <span className="font-display font-medium text-sm text-[var(--foreground)]">
              {messages.length > 0
                ? "Conversación actual"
                : "Nueva conversación"}
            </span>
            <button className="p-1.5 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors duration-150">
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Messages or suggestions */}
          {messages.length === 0 && !isThinking ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="w-10 h-10 text-[var(--foreground-tertiary)] mb-4" />
                <p className="text-sm text-[var(--foreground-secondary)] mb-6">
                  Pregúntame sobre tu material. Responderé únicamente con lo que
                  está en tus archivos subidos.
                </p>
              </div>
              <TutorSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            <TutorMessages
              messages={messages}
              isThinking={isThinking}
              onReferenceClick={handleReferenceClick}
            />
          )}

          {/* Input */}
          <TutorInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isThinking}
          />
        </>
      ) : (
        <ResourcePreview
          hasResource={hasResource}
          onBackToTutor={handleBackToTutor}
        />
      )}

      <div ref={messagesEndRef} />
    </aside>
  );
}
