"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface RoleplayTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export function RoleplayTimer({
  initialMinutes,
  onTimeUp,
}: RoleplayTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isLow = secondsLeft < 60;
  const isCritical = secondsLeft < 30;

  return (
    <div
      className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm
      ${
        isCritical
          ? "bg-[var(--alert-muted)] text-[var(--alert)]"
          : isLow
            ? "bg-[var(--secondary-muted)] text-[var(--secondary)]"
            : "bg-[var(--background-elevated)] text-[var(--foreground-secondary)]"
      }
    `}
    >
      <Clock className="w-4 h-4" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
