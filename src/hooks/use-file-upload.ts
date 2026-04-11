import { useCallback } from "react";
import { useResourcesStore } from "@/lib/stores/zustand-store";
import { useJobPolling } from "./use-job-polling";
import type { PendingResource } from "@/components/modals/UploadModal/types";

export function useFileUpload(categoryId: string) {
  const { addResource, updateResourceStatus, updateResourceJobId } =
    useResourcesStore();

  const { pollJobStatus } = useJobPolling();

  const uploadSingleFile = useCallback(
    async (file: PendingResource, index: number, total: number) => {
      console.log(
        `\n📄 [UploadModal] Procesando archivo ${index + 1}/${total}:`,
        { name: file.name, type: file.type, sourceUrl: file.sourceUrl },
      );

      const resourceId = addResource({
        categoryId: categoryId,
        name: file.name,
        type: file.type,
        url: file.sourceUrl,
      });

      console.log(`✅ [UploadModal] Resource creado en Zustand:`, resourceId);
      updateResourceStatus(resourceId, "uploading");

      const formData = new FormData();
      formData.append("categoryId", categoryId);

      if (file.sourceUrl) {
        console.log(`🔗 [UploadModal] URL detectada: ${file.sourceUrl}`);
        formData.append("sourceUrl", file.sourceUrl);
      } else if (file.file) {
        console.log(
          `📁 [UploadModal] Archivo local: ${file.file.name} (${file.file.size} bytes)`,
        );
        formData.append("file", file.file);
        formData.append("name", file.name);
      } else {
        console.error(`❌ [UploadModal] Sin sourceUrl ni file object:`, file);
        updateResourceStatus(resourceId, "error");
        return;
      }

      try {
        console.log(`📤 [UploadModal] Enviando a /api/upload...`);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        console.log(`📥 [UploadModal] Respuesta de /api/upload:`, {
          ok: response.ok,
          status: response.status,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `❌ [UploadModal] Error en /api/upload.`,
            response.status,
            errorText,
          );
          updateResourceStatus(resourceId, "error");
          return;
        }

        const responseData = await response.json();
        console.log(`✅ [UploadModal] Job creado:`, responseData);

        const { jobId } = responseData;
        updateResourceJobId(resourceId, jobId, "queued");

        console.log(`🔄 [UploadModal] Iniciando polling para job:`, jobId);

        // Iniciar polling sin bloquear (fire and forget)
        pollJobStatus(jobId, resourceId);
      } catch (error) {
        console.error(`❌ [UploadModal] Error subiendo archivo:`, error);
        updateResourceStatus(resourceId, "error");
      }
    },
    [
      addResource,
      categoryId,
      updateResourceStatus,
      updateResourceJobId,
      pollJobStatus,
    ],
  );

  const uploadMultipleFiles = useCallback(
    async (files: PendingResource[]) => {
      console.log("🚀 [UploadModal] Iniciando upload de archivos:", files);
      console.log(
        `📊 [UploadModal] Total de archivos a procesar: ${files.length}`,
      );

      const total = files.length;
      await Promise.allSettled(
        files.map((file, index) => uploadSingleFile(file, index, total)),
      );

      console.log(`\n✅ [UploadModal] ${total} upload(s) lanzados en paralelo`);
    },
    [uploadSingleFile],
  );

  return {
    uploadSingleFile,
    uploadMultipleFiles,
  };
}
