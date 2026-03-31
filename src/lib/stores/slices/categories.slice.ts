import type { StateCreator } from "zustand";

import type { Category, ProcessingItem } from "../../types";

interface CreateCategoryInput {
  nombre: string;
}

interface UpdateCategoryInput {
  nombre?: string;
}

export type CategoriesSlice = {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<Category | null>;
  updateCategory: (id: string, updates: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

export type ProcessingSlice = {
  queue: ProcessingItem[];
  addToQueue: (item: Omit<ProcessingItem, "currentStep" | "status">) => void;
  advanceStep: (id: string) => void;
  markDone: (id: string) => void;
  markError: (id: string) => void;
  removeFromQueue: (id: string) => void;
};

export type CategoryStore = CategoriesSlice & ProcessingSlice;

export const createCategoriesSlice: StateCreator<
  CategoryStore,
  [],
  [],
  CategoriesSlice
> = (set, get) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Error al obtener categorías");
      }
      const categories = await response.json();
      set({ categories, isLoading: false });
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({ isLoading: false });
    }
  },

  createCategory: async ({ nombre }) => {
    const normalizedName = nombre.trim();

    if (!normalizedName) {
      return null;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: normalizedName }),
      });

      if (!response.ok) {
        throw new Error("Error al crear categoría");
      }

      const newCategory = await response.json();

      set((state) => ({
        categories: [...state.categories, newCategory],
      }));

      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar categoría");
      }

      const updatedCategory = await response.json();

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category,
        ),
      }));
    } catch (error) {
      console.error("Error updating category:", error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar categoría");
      }

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  },
});

export const createProcessingSlice: StateCreator<
  CategoryStore,
  [],
  [],
  ProcessingSlice
> = (set) => ({
  queue: [],

  addToQueue: (item) =>
    set((state) => ({
      queue: [
        ...state.queue,
        { ...item, currentStep: 0, status: "processing" },
      ],
    })),

  advanceStep: (id) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, currentStep: item.currentStep + 1 } : item,
      ),
    })),

  markDone: (id) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, status: "done" } : item,
      ),
    })),

  markError: (id) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, status: "error" } : item,
      ),
    })),

  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
});
