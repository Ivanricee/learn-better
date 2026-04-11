import { useCallback, useEffect, useRef } from "react";
import { useResourcesStore } from "@/lib/stores/zustand-store";

export function useJobPolling() {
  const {
    updateResourceProgress,
    updateResourceStatus,
    updateResourceStep,
    updateResourceError,
  } = useResourcesStore();

  const activeIntervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(
    new Set(),
  );

  const pollJobStatus = useCallback(
    (jobId: string, resourceId: string) => {
      console.log(
        `🔄 [Polling] Iniciando polling para job ${jobId}, resource ${resourceId}`,
      );

      const interval = setInterval(async () => {
        try {
          console.log(`📡 [Polling] Consultando /api/jobs/${jobId}...`);

          const response = await fetch(`/api/jobs/${jobId}`);

          console.log(`📥 [Polling] Respuesta:`, {
            ok: response.ok,
            status: response.status,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [Polling] Error al consultar job:`, errorText);
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
            updateResourceStatus(resourceId, "error");
            return;
          }

          const job = await response.json();
          console.log(
            `📊 [${new Date().toISOString()}] [Polling] Estado del job:`,
            {
              status: job.status,
              step: job.step,
              progress: job.progress,
              error_type: job.error_type,
            },
          );

          updateResourceProgress(resourceId, job.progress || 0);
          if (job.step) {
            updateResourceStep(resourceId, job.step);
          }

          if (job.status === "done") {
            console.log(`✅ [Polling] Job completado, deteniendo polling`);
            updateResourceStatus(resourceId, "done");
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
          } else if (job.status === "error" || job.status === "cancelled") {
            console.log(
              `❌ [Polling] Job con error/cancelado, deteniendo polling`,
            );
            updateResourceStatus(resourceId, job.status);
            if (job.error_message) {
              updateResourceError(resourceId, job.error_message);
            }
            clearInterval(interval);
            activeIntervalsRef.current.delete(interval);
          } else if (job.status === "processing") {
            console.log(
              `⚙️ [Polling] Job en procesamiento, actualizando UI...`,
            );
            updateResourceStatus(resourceId, "processing");
          } else if (job.status === "pending" || job.status === "queued") {
            console.log(
              `⏳ [Polling] Job en cola (${job.status}), actualizando UI...`,
            );
            updateResourceStatus(resourceId, job.status);
          } else {
            console.warn(
              `⚠️ [Polling] Status desconocido: "${job.status}" - NO se actualiza UI`,
            );
          }
        } catch (error) {
          console.error("❌ [Polling] Error general:", error);
          clearInterval(interval);
          activeIntervalsRef.current.delete(interval);
          updateResourceStatus(resourceId, "error");
        }
      }, 2000);

      activeIntervalsRef.current.add(interval);
    },
    [
      updateResourceProgress,
      updateResourceStatus,
      updateResourceStep,
      updateResourceError,
    ],
  );

  const clearAllPolling = useCallback(() => {
    activeIntervalsRef.current.forEach((id) => clearInterval(id));
    activeIntervalsRef.current.clear();
  }, []);

  useEffect(() => {
    const intervals = activeIntervalsRef.current;
    return () => {
      intervals.forEach((id) => clearInterval(id));
      intervals.clear();
    };
  }, []);

  return {
    pollJobStatus,
    clearAllPolling,
  };
}
