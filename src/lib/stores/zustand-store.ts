import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  ViewType,
  ActivityType,
  RightPanelTab,
  ProcessingItem,
  TutorMessage,
} from "../types";
import { categories as mockCategories } from "../mock-data";

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

interface CategoryState {
  categories: Category[];
  createCategory: (input: CreateCategoryInput) => Category | null;
  updateCategory: (id: number, updates: UpdateCategoryInput) => void;
  deleteCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "trainery-categories-storage",
    },
  ),
);

// App navigation store
interface AppState {
  currentView: ViewType;
  currentCategoryId: number | null;
  currentThemeId: string | null;
  currentActivity: ActivityType;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  sidebarWidth: number;
  temarioGenerated: boolean;

  setView: (view: ViewType) => void;
  setCategory: (id: number | null) => void;
  setTheme: (id: string | null) => void;
  setActivity: (activity: ActivityType) => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setSidebarWidth: (width: number) => void;
  setTemarioGenerated: (generated: boolean) => void;
  resetToHome: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: "home",
      currentCategoryId: null,
      currentThemeId: null,
      currentActivity: null,
      rightPanelOpen: false,
      rightPanelTab: "tutor",
      sidebarWidth: 240,
      temarioGenerated: false,

      setView: (view) => set({ currentView: view }),
      setCategory: (id) =>
        set({
          currentCategoryId: id,
          currentThemeId: null,
          currentActivity: "theme",
        }),
      setTheme: (id) => set({ currentThemeId: id, currentActivity: "theme" }),
      setActivity: (activity) => set({ currentActivity: activity }),
      toggleRightPanel: () =>
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
      setSidebarWidth: (width) =>
        set({ sidebarWidth: Math.min(320, Math.max(200, width)) }),
      setTemarioGenerated: (generated) => set({ temarioGenerated: generated }),
      resetToHome: () =>
        set({
          currentView: "home",
          currentCategoryId: null,
          currentThemeId: null,
          currentActivity: null,
          rightPanelOpen: false,
        }),
    }),
    {
      name: "trainery-app-storage",
      partialize: (state) => ({ sidebarWidth: state.sidebarWidth }),
    },
  ),
);

// Processing queue store
interface ProcessingState {
  queue: ProcessingItem[];
  addToQueue: (item: Omit<ProcessingItem, "currentStep" | "status">) => void;
  advanceStep: (id: string) => void;
  markDone: (id: string) => void;
  markError: (id: string) => void;
  removeFromQueue: (id: string) => void;
}

export const useProcessingStore = create<ProcessingState>((set) => ({
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
}));

// Tutor conversations store
interface TutorState {
  conversations: Record<number, TutorMessage[]>;
  activeConversationId: string | null;
  tutorConsultsDuringRoleplay: number;

  addMessage: (categoryId: number, message: TutorMessage) => void;
  clearConversation: (categoryId: number) => void;
  incrementRoleplayConsults: () => void;
  resetRoleplayConsults: () => void;
}

export const useTutorStore = create<TutorState>((set) => ({
  conversations: {},
  activeConversationId: null,
  tutorConsultsDuringRoleplay: 0,

  addMessage: (categoryId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [categoryId]: [...(state.conversations[categoryId] || []), message],
      },
    })),

  clearConversation: (categoryId) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [categoryId]: [],
      },
    })),

  incrementRoleplayConsults: () =>
    set((state) => ({
      tutorConsultsDuringRoleplay: state.tutorConsultsDuringRoleplay + 1,
    })),

  resetRoleplayConsults: () => set({ tutorConsultsDuringRoleplay: 0 }),
}));
