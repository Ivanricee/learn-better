"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { diagnosticQuestions } from "@/lib/mock-data";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function DiagnosticModal({
  isOpen,
  onClose,
  onComplete,
}: DiagnosticModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string | null>
  >({});
  const [openAnswer, setOpenAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const question = diagnosticQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === diagnosticQuestions.length - 1;
  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

  const handleOptionSelect = (option: string) => {
    setSelectedOptions({ ...selectedOptions, [currentQuestion]: option });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Show generating state
      setIsGenerating(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setOpenAnswer("");
    }
  };

  const canProceed =
    question.tipo === "opcion"
      ? selectedOptions[currentQuestion] !== undefined &&
        selectedOptions[currentQuestion] !== null
      : openAnswer.trim().length > 0;

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-[var(--foreground)] mb-2">
            Generando tu temario...
          </h2>
          <p className="text-sm text-[var(--foreground-secondary)]">
            Analizando tu material y conocimiento previo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay - doesn't close on click */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--foreground-tertiary)]">
              {currentQuestion + 1} de {diagnosticQuestions.length}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section title */}
        <p className="text-xs uppercase tracking-wider font-display font-semibold text-[var(--foreground-tertiary)] mb-2">
          {question.seccion}
        </p>

        {/* Question */}
        <h2 className="font-display font-bold text-xl text-[var(--foreground)] mb-6">
          {question.pregunta}
        </h2>

        {/* Options or text input */}
        {question.tipo === "opcion" ? (
          <div className="space-y-2 mb-6">
            {question.opciones?.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl border text-sm
                  transition-all duration-150
                  ${
                    selectedOptions[currentQuestion] === option
                      ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]"
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full h-24 px-4 py-3 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:border-[var(--primary)] outline-none resize-none transition-colors duration-150 mb-6"
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isLastQuestion ? "Generar temario →" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}
