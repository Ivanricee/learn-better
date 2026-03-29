"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ThemeItem } from "@/components/sidebar/ThemeItem";
import type { Theme } from "@/lib/types";

interface ZoneAccordionProps {
  title: string;
  themes: Theme[];
  variant: "prerequisites" | "material" | "next";
  defaultOpen?: boolean;
  activeThemeId: string | null;
  onThemeClick: (id: string) => void;
}

const variantStyles = {
  prerequisites: "text-foreground-tertiary",
  material: "text-foreground",
  next: "text-foreground-tertiary",
};

export function ZoneAccordion({
  title,
  themes,
  variant,
  defaultOpen = false,
  activeThemeId,
  onThemeClick,
}: ZoneAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "zone" : undefined}
    >
      <AccordionItem
        value="zone"
        className="border-b border-[var(--border-subtle)]"
      >
        <AccordionTrigger className="px-4 py-3 hover:bg-[var(--background-elevated)] hover:no-underline">
          <div className="flex items-center gap-2 flex-1">
            <span className={`text-sm font-medium ${variantStyles[variant]}`}>
              {title}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--background-elevated)] text-[var(--foreground-tertiary)] mr-2">
            {themes.length}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-0 pb-0">
          <div className="px-2 pb-2 space-y-0.5">
            {themes.map((theme) => (
              <ThemeItem
                key={theme.id}
                theme={theme}
                isActive={activeThemeId === theme.id}
                onClick={() => onThemeClick(theme.id)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
