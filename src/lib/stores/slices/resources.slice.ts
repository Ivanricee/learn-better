import type { StateCreator } from "zustand";

import type { Resource, ResourceStatus } from "../../types";

export type ResourcesSlice = {
  resources: Resource[];
  addResource: (
    resource: Omit<Resource, "id" | "createdAt" | "progress" | "status">,
  ) => string;
  updateResourceStatus: (id: string, status: ResourceStatus) => void;
  updateResourceProgress: (id: string, progress: number) => void;
  updateResourceJobId: (id: string, jobId: string) => void;
  updateResourceError: (id: string, error_message: string) => void;
  removeResource: (id: string) => void;
  getResourcesByCategory: (categoryId: string) => Resource[];
  loadResourcesFromCategory: (categoryId: string) => Promise<void>;
  setResources: (resources: Resource[]) => void;
};

const mockResources: Resource[] = [
  {
    id: "r1",
    categoryId: "mock-cat-1",
    name: "Introduccion a Ventas B2B",
    type: "youtube",
    status: "done",
    progress: 100,
    url: "https://youtube.com/watch?v=abc123",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "r2",
    categoryId: "mock-cat-1",
    name: "Manual de Objeciones.pdf",
    type: "pdf",
    status: "done",
    progress: 100,
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "r3",
    categoryId: "mock-cat-1",
    name: "Llamada de ejemplo cliente.mp3",
    type: "audio",
    status: "done",
    progress: 100,
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "r4",
    categoryId: "mock-cat-1",
    name: "Tips de cierre @salescoach",
    type: "tiktok",
    status: "processing",
    progress: 65,
    url: "https://tiktok.com/@salescoach/video/123",
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "r5",
    categoryId: "mock-cat-1",
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

  updateResourceJobId: (id, jobId) =>
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id ? { ...resource, jobId } : resource,
      ),
    })),

  updateResourceError: (id, error_message) =>
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id ? { ...resource, error_message } : resource,
      ),
    })),

  removeResource: (id) =>
    set((state) => ({
      resources: state.resources.filter((resource) => resource.id !== id),
    })),

  getResourcesByCategory: (categoryId) =>
    get().resources.filter((resource) => resource.categoryId === categoryId),

  loadResourcesFromCategory: async (categoryId) => {
    try {
      console.log(
        `📥 [Resources] Cargando recursos de categoría: ${categoryId}`,
      );
      const response = await fetch(`/api/categories/${categoryId}/resources`);

      if (!response.ok) {
        console.error(
          `❌ [Resources] Error al cargar recursos: ${response.status}`,
        );
        return;
      }

      const data = await response.json();
      console.log(`✅ [Resources] Recursos cargados:`, data.length);

      // Convertir a Resource: id = file.id, jobId = job.id
      const apiResources: Resource[] = data
        .filter((r: any) => r.job !== null) // solo los que tienen job activo
        .map((r: any) => ({
          id: r.id,
          jobId: r.job.id,
          categoryId,
          name: r.name,
          type: r.type,
          status: r.job.status,
          progress: r.job.progress ?? 0,
          url: r.source_url ?? undefined,
          error_message: r.job.error_message ?? undefined,
          createdAt: new Date(r.created_at),
        }));

      // Combinar con recursos locales (recién subidos, aún sin sync)
      set((state) => {
        const currentLocal = state.resources.filter(
          (r) => r.categoryId === categoryId,
        );
        const apiFileIds = new Set(apiResources.map((r) => r.id));
        const localOnly = currentLocal.filter((r) => !apiFileIds.has(r.id));

        console.log(
          `🔄 [Resources] Combinando: ${apiResources.length} de API + ${localOnly.length} locales`,
        );

        return {
          resources: [
            ...state.resources.filter((r) => r.categoryId !== categoryId),
            ...apiResources,
            ...localOnly,
          ],
        };
      });
    } catch (error) {
      console.error("❌ [Resources] Error al cargar recursos:", error);
    }
  },

  setResources: (resources) => set({ resources }),
});
