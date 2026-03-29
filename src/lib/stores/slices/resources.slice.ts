import type { StateCreator } from "zustand";

import type { Resource, ResourceStatus } from "../../types";

export type ResourcesSlice = {
  resources: Resource[];
  addResource: (
    resource: Omit<Resource, "id" | "createdAt" | "progress" | "status">,
  ) => string;
  updateResourceStatus: (id: string, status: ResourceStatus) => void;
  updateResourceProgress: (id: string, progress: number) => void;
  removeResource: (id: string) => void;
  getResourcesByCategory: (categoryId: number) => Resource[];
};

const mockResources: Resource[] = [
  {
    id: "r1",
    categoryId: 1,
    name: "Introduccion a Ventas B2B",
    type: "youtube",
    status: "done",
    progress: 100,
    url: "https://youtube.com/watch?v=abc123",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "r2",
    categoryId: 1,
    name: "Manual de Objeciones.pdf",
    type: "pdf",
    status: "done",
    progress: 100,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "r3",
    categoryId: 1,
    name: "Llamada de ejemplo cliente.mp3",
    type: "audio",
    status: "done",
    progress: 100,
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "r4",
    categoryId: 1,
    name: "Tips de cierre @salescoach",
    type: "tiktok",
    status: "processing",
    progress: 65,
    url: "https://tiktok.com/@salescoach/video/123",
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "r5",
    categoryId: 1,
    name: "Notas de reunion.txt",
    type: "text",
    status: "queued",
    progress: 0,
    createdAt: new Date("2024-01-16"),
  },
];

export const createResourcesSlice: StateCreator<
  ResourcesSlice,
  [],
  [],
  ResourcesSlice
> = (set, get) => ({
  resources: mockResources,

  addResource: (resource) => {
    const id = Math.random().toString(36).substring(7);
    const newResource: Resource = {
      ...resource,
      id,
      status: "queued",
      progress: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      resources: [...state.resources, newResource],
    }));

    return id;
  },

  updateResourceStatus: (id, status) =>
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              status,
              progress: status === "done" ? 100 : resource.progress,
            }
          : resource,
      ),
    })),

  updateResourceProgress: (id, progress) =>
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id ? { ...resource, progress } : resource,
      ),
    })),

  removeResource: (id) =>
    set((state) => ({
      resources: state.resources.filter((resource) => resource.id !== id),
    })),

  getResourcesByCategory: (categoryId) =>
    get().resources.filter((resource) => resource.categoryId === categoryId),
});
