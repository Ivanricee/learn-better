"use client";

import type { Category } from "@/lib/types";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (id: string) => void;
}

export function CategoryGrid({
  categories,
  onCategoryClick,
}: CategoryGridProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground-tertiary">
        Tus categorías
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CategoryCard isNewCard />

        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => onCategoryClick(category.id)}
          />
        ))}
      </div>
    </section>
  );
}
