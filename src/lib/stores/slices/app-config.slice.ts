import type { StateCreator } from "zustand";

import type {
  ActivityType,
  LeftPanelTab,
  RightPanelTab,
  ViewType,
} from "../../types";

export type AppConfigSlice = {
  currentView: ViewType;
  currentCategoryId: number | null;
  currentThemeId: string | null;
  currentActivity: ActivityType;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  leftPanelTab: LeftPanelTab;
  sidebarWidth: number;
  temarioGenerated: boolean;

  setView: (view: ViewType) => void;
  setCategory: (id: number | null) => void;
  setTheme: (id: string | null) => void;
  setActivity: (activity: ActivityType) => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setSidebarWidth: (width: number) => void;
  setTemarioGenerated: (generated: boolean) => void;
  resetToHome: () => void;
};

export type AppStore = AppConfigSlice;

export const createAppConfigSlice: StateCreator<
  AppStore,
  [],
  [],
  AppConfigSlice
> = (set) => ({
  currentView: "home",
  currentCategoryId: null,
  currentThemeId: null,
  currentActivity: null,
  rightPanelOpen: false,
  rightPanelTab: "tutor",
  leftPanelTab: "temario",
  sidebarWidth: 270,
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
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.min(400, Math.max(200, width)) }),
  setTemarioGenerated: (generated) => set({ temarioGenerated: generated }),
  resetToHome: () =>
    set({
      currentView: "home",
      currentCategoryId: null,
      currentThemeId: null,
      currentActivity: null,
      rightPanelOpen: false,
      leftPanelTab: "temario",
    }),
});
