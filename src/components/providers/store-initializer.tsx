"use client";

import { useEffect, useRef } from "react";
import { useCategoryStore } from "@/lib/stores/zustand-store";

export function StoreInitializer() {
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchCategories();
    }
  }, [fetchCategories]);

  return null;
}
