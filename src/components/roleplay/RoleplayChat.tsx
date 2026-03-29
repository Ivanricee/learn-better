"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, User } from "lucide-react";
import { RoleplayTimer } from "./RoleplayTimer";
import {
  roleplayScenario,
  roleplayInitialMessage,
  roleplayClientResponses,
} from "@/lib/mock-data";
import type { RoleplayMessage } from "@/lib/types";

interface RoleplayChatProps {
  onEnd: () => void;
  onBack: () => void;
}

export function RoleplayChat({ onEnd, onBack }: RoleplayChatProps) {
  const [messages, setMessages] = useState<RoleplayMessage[]>([
    { ...roleplayInitialMessage, timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isClientTyping]);

  const handleTimeUp = useCallback(() => {
    // Auto end when time is up
    onEnd();
  }, [onEnd]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: RoleplayMessage = {
      rol: "usuario",
      mensaje: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate client response
    setIsClientTyping(true);
    setTimeout(
      () => {
        setIsClientTyping(false);

        // Get next response or end if we've reached the limit
        if (responseIndex >= roleplayClientResponses.length) {
          onEnd();
          return;
        }

        const clientMessage: RoleplayMessage = {
          rol: "cliente",
          nombre: "Carlos (Director de Expansión)",
          mensaje: roleplayClientResponses[responseIndex],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, clientMessage]);
        setResponseIndex((prev) => prev + 1);
      },
      1500 + Math.random() * 1000,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    onBack();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--background-panel)]">
        <button
          onClick={handleExitClick}
          className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Salir
        </button>

        <h2 className="font-display font-semibold text-sm text-[var(--foreground)] truncate px-4">
          {roleplayScenario.titulo}
        </h2>

        <div className="flex items-center gap-3">
          <RoleplayTimer
            initialMinutes={roleplayScenario.tiempo_estimado}
            onTimeUp={handleTimeUp}
          />
          <button
            onClick={onEnd}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-150"
          >
            Terminar sesión
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[80%] rounded-xl p-4
                ${
                  msg.rol === "usuario"
                    ? "bg-[var(--primary-muted)] border-l-2 border-[var(--primary)]"
                    : "bg-[var(--background-panel)] border-l-2 border-[var(--secondary)]"
                }
              `}
            >
              {msg.rol === "cliente" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--secondary-muted)] flex items-center justify-center">
                    <span className="text-xs font-medium text-[var(--secondary)]">
                      C
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                    {msg.nombre}
                  </span>
                </div>
              )}
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                {msg.mensaje}
              </p>
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

        {/* Typing indicator */}
        {isClientTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--background-panel)] border-l-2 border-[var(--secondary)] rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--secondary-muted)] flex items-center justify-center">
                  <span className="text-xs font-medium text-[var(--secondary)]">
                    C
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--foreground-tertiary)]" />
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--foreground-tertiary)]" />
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--foreground-tertiary)]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Responde al cliente..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--primary)] outline-none resize-none transition-colors duration-150"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 rounded-xl bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowExitConfirm(false)}
          />
          <div className="relative w-full max-w-sm mx-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="font-display font-bold text-lg text-[var(--foreground)] mb-2">
              ¿Salir del escenario?
            </h3>
            <p className="text-sm text-[var(--foreground-secondary)] mb-6">
              Tu progreso no se guardará.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--alert)] text-white hover:opacity-90 transition-opacity duration-150"
              >
                Salir de todas formas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
