import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ViewType,
  ActivityType,
  RightPanelTab,
  ProcessingItem,
  TutorMessage,
} from "../types";

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
