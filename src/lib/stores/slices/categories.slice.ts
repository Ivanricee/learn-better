import type { StateCreator } from "zustand";

import type { Category, ProcessingItem } from "../../types";
import { categories as mockCategories } from "../../mock-data";

interface CreateCategoryInput {
  nombre: string;
  temario?: string[];
}

interface UpdateCategoryInput {
  nombre?: string;
  progreso?: number;
  temas?: number;
  temario?: string[];
}

export type CategoriesSlice = {
  categories: Category[];
  createCategory: (input: CreateCategoryInput) => Category | null;
  updateCategory: (id: number, updates: UpdateCategoryInput) => void;
  deleteCategory: (id: number) => void;
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
> = (set) => ({
  categories: [...mockCategories],

  createCategory: ({ nombre, temario }) => {
    const normalizedName = nombre.trim();

    if (!normalizedName) {
      return null;
    }

    let createdCategory: Category | null = null;

    set((state) => {
      const nextId =
        state.categories.length > 0
          ? Math.max(...state.categories.map((category) => category.id)) + 1
          : 1;

      createdCategory = {
        id: nextId,
        nombre: normalizedName,
        temas: temario?.length ?? 0,
        progreso: 0,
      };

      return {
        categories: [...state.categories, createdCategory],
      };
    });

    return createdCategory;
  },

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((category) => {
        if (category.id !== id) {
          return category;
        }

        const { temario, nombre, ...rest } = updates;

        const nextTemas =
          temario !== undefined
            ? temario.length
            : typeof rest.temas === "number"
              ? rest.temas
              : category.temas;

        return {
          ...category,
          ...rest,
          temas: nextTemas,
          nombre: nombre?.trim() || category.nombre,
        };
      }),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    })),
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
