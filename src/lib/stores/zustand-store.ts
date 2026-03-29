import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createCategoriesSlice,
  createProcessingSlice,
  type CategoryStore,
} from "./slices/categories.slice";
import {
  createAppConfigSlice,
  type AppConfigSlice,
} from "./slices/app-config.slice";
import {
  createResourcesSlice,
  type ResourcesSlice,
} from "./slices/resources.slice";
import { createTutorSlice, type TutorStore } from "./slices/tutor.slice";

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (...a) => ({
      ...createCategoriesSlice(...a),
      ...createProcessingSlice(...a),
    }),
    {
      name: "trainery-categories-storage",
      partialize: (state) => ({ categories: state.categories }),
    },
  ),
);

export const useProcessingStore = useCategoryStore;

export type AppStore = AppConfigSlice & ResourcesSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAppConfigSlice(...a),
      ...createResourcesSlice(...a),
    }),
    {
      name: "trainery-app-storage",
      partialize: (state) => ({ sidebarWidth: state.sidebarWidth }),
    },
  ),
);

export const useTutorStore = create<TutorStore>()((...a) => ({
  ...createTutorSlice(...a),
}));

export const useResourcesStore = useAppStore;
export const useResourceStore = useResourcesStore;
