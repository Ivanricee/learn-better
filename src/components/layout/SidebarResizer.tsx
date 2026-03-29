"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/stores/zustand-store";

export function SidebarResizer() {
  const { setSidebarWidth } = useAppStore();
  const isResizingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      setSidebarWidth(e.clientX);
    };

    const handleMouseUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSidebarWidth]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`relative w-1 flex-shrink-0 cursor-col-resize group`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 transition-all duration-150 ${
          isDragging
            ? "bg-[var(--primary)] w-[3px]"
            : "bg-[var(--border-hover)] group-hover:bg-[var(--primary)] group-hover:w-[3px]"
        }`}
      />
    </div>
  );
}
