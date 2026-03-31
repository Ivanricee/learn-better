import PgBoss from "pg-boss";

// Usar variable global para persistir pg-boss entre hot reloads de Next.js
declare global {
  var pgBossInstance: PgBoss | undefined;
}

export async function getJobQueue(): Promise<PgBoss> {
  if (!global.pgBossInstance) {
    console.log("🔧 [JobQueue] Inicializando pg-boss (modo cliente)...");
    console.log(
      `🔍 [DEBUG] DATABASE_URL configurada: ${process.env.DATABASE_URL ? "SÍ" : "NO"}`,
    );
    const startTime = Date.now();

    // Usar overload con connection string para compatibilidad con pg-boss@11
    const boss = new PgBoss(process.env.DATABASE_URL!);

    boss.on("error", (error) => {
      console.error(
        "❌ [JobQueue] Error en pg-boss, reseteando instancia:",
        error,
      );
      global.pgBossInstance = undefined;
    });

    console.log(`🔍 [DEBUG] Iniciando conexión a pg-boss...`);
    await boss.start();
    const duration = Date.now() - startTime;
    console.log(`✅ pg-boss iniciado en modo cliente en ${duration}ms`);
    console.log(`ℹ️ [JobQueue] Esta instancia SOLO envía jobs, NO los procesa`);
    console.log(
      `🔍 [DEBUG] Instancia de pg-boss guardada en global.pgBossInstance`,
    );

    global.pgBossInstance = boss;
  } else {
    console.log("♻️ [JobQueue] Reutilizando instancia existente de pg-boss");
  }

  return global.pgBossInstance;
}

// Tipos para jobs
export interface ProcessFileJobData {
  jobId: string;
  fileId: string;
  categoryId: string;
  fileType: string;
  testErrorType?: string; // Para simular errores en Fase 1
}

// Encolar un job de procesamiento de archivo
export async function enqueueFileProcessing(
  data: ProcessFileJobData,
): Promise<string | null> {
  const timestamp = new Date().toISOString();
  console.log(`📤 [${timestamp}] [JobQueue] Encolando job:`, data);
  console.log(`🔍 [DEBUG] Obteniendo instancia de pg-boss...`);
  const queue = await getJobQueue();
  console.log(
    `🔍 [DEBUG] Instancia obtenida, enviando job a cola 'process-file'...`,
  );
  console.log(`🔍 [DEBUG] Datos del job:`, JSON.stringify(data, null, 2));
  console.log(
    `🔍 [DEBUG] Opciones: retryLimit=2, retryDelay=5, retryBackoff=true`,
  );

  const pgBossJobId = await queue.send("process-file", data, {
    retryLimit: 2,
    retryDelay: 5,
    retryBackoff: true,
  });

  console.log(
    `✅ [${new Date().toISOString()}] [JobQueue] Job encolado en pg-boss con ID:`,
    pgBossJobId,
  );
  console.log(`🔍 [DEBUG] pgBossJobId retornado: ${pgBossJobId}`);
  console.log(`🔍 [DEBUG] Job insertado en la cola 'process-file' de pg-boss`);
  console.log(
    `⏱️ [JobQueue] El worker debería recibir este job en ~500ms si está activo`,
  );
  return pgBossJobId;
}

// Cancelar un job
export async function cancelJob(jobId: string): Promise<void> {
  console.log(`🔍 [DEBUG] Cancelando job en pg-boss: ${jobId}`);
  const queue = await getJobQueue();
  await queue.cancel("process-file", jobId);
  console.log(`✅ [DEBUG] Job cancelado en pg-boss`);
}

// Obtener estado de un job
export async function getJobStatus(jobId: string) {
  console.log(`🔍 [DEBUG] Consultando status de job en pg-boss: ${jobId}`);
  const queue = await getJobQueue();
  const status = await queue.getJobById("process-file", jobId);
  console.log(`🔍 [DEBUG] Status obtenido:`, status);
  return status;
}

// Cerrar pg-boss (útil para shutdown)
export async function closeJobQueue(): Promise<void> {
  if (global.pgBossInstance) {
    await global.pgBossInstance.stop();
    global.pgBossInstance = undefined;
    console.log("✅ pg-boss detenido correctamente");
  }
}
