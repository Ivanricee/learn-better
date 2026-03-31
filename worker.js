// Worker independiente para procesamiento de archivos
// Ejecutar con: node worker.js o npm run worker

import { existsSync, readFileSync } from "node:fs";

// Cargar variables de entorno desde archivo sin depender de dotenv
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^['\"]|['\"]$/g, "");
    process.env[key] = value;
  }
}

if (process.env.NODE_ENV !== "production") {
  // En desarrollo, cargar .env.local
  loadEnvFile(".env.local");
} else {
  // En producción, cargar .env si existe (fallback)
  loadEnvFile(".env");
}

import PgBoss from "pg-boss";
import pkg from "pg";
const { Pool } = pkg;

// Configuración
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está configurada");
  process.exit(1);
}

// Pool de PostgreSQL para queries directas
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
});

// Flujos de procesamiento simulados por tipo de archivo
const PROCESSING_FLOWS = {
  youtube: [
    { step: "downloading", duration: 2000, progress: 20 },
    { step: "transcribing", duration: 5000, progress: 60 },
    { step: "vectorizing", duration: 3000, progress: 85 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  tiktok: [
    { step: "downloading", duration: 2000, progress: 20 },
    { step: "transcribing", duration: 5000, progress: 60 },
    { step: "vectorizing", duration: 3000, progress: 85 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  instagram: [
    { step: "downloading", duration: 2000, progress: 20 },
    { step: "transcribing", duration: 5000, progress: 60 },
    { step: "vectorizing", duration: 3000, progress: 85 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  video: [
    { step: "converting", duration: 3000, progress: 20 },
    { step: "transcribing", duration: 5000, progress: 60 },
    { step: "vectorizing", duration: 3000, progress: 85 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  audio: [
    { step: "converting", duration: 2000, progress: 20 },
    { step: "transcribing", duration: 5000, progress: 60 },
    { step: "vectorizing", duration: 3000, progress: 85 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  pdf: [
    { step: "extracting", duration: 2000, progress: 30 },
    { step: "vectorizing", duration: 3000, progress: 70 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  image: [
    { step: "extracting", duration: 2000, progress: 30 },
    { step: "vectorizing", duration: 3000, progress: 70 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  text: [
    { step: "vectorizing", duration: 2000, progress: 60 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
  markdown: [
    { step: "vectorizing", duration: 2000, progress: 60 },
    { step: "generating_temario", duration: 2000, progress: 100 },
  ],
};

// Errores simulados para testing
const ERROR_SIMULATIONS = {
  audio_too_long: {
    step: "transcribing",
    type: "audio_too_long",
    message: "El audio es demasiado largo (>2 horas)",
  },
  whisper_quota: {
    step: "transcribing",
    type: "whisper_quota",
    message: "Cuota de Whisper excedida (429)",
  },
  upload_incomplete: {
    step: "uploading",
    type: "upload_incomplete",
    message: "Archivo corrupto o incompleto",
  },
  download_failed: {
    step: "downloading",
    type: "download_failed",
    message: "No se pudo descargar el video",
  },
  connection_error: {
    step: "random",
    type: "connection_error",
    message: "Error de conexión",
  },
  cancellation: {
    step: "transcribing",
    type: "cancelled",
    message: "Job cancelado por el usuario",
  },
};

// Helper: actualizar job en la base de datos
async function updateJob(jobId, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  values.push(jobId);

  const query = `
    UPDATE jobs
    SET ${fields.join(", ")}, updated_at = now()
    WHERE id = $${paramIndex}
  `;

  await pool.query(query, values);
}

// Helper: verificar si el job fue cancelado (eliminado de la tabla)
async function isJobCancelled(jobId) {
  const result = await pool.query("SELECT id FROM jobs WHERE id = $1", [jobId]);
  // Si no existe el registro, fue cancelado
  return result.rows.length === 0;
}

// Función principal de procesamiento
async function processFile(job) {
  const { jobId, fileId, categoryId, fileType, testErrorType } = job.data;

  const startTime = Date.now();
  console.log(`\n⚙️  Procesando: ${fileType.toUpperCase()}`);
  console.log(`🔍 [DEBUG] Job recibido:`, {
    jobId,
    fileId,
    categoryId,
    fileType,
    testErrorType,
  });

  try {
    // Verificar que el job existe y obtener su status actual
    console.log(`🔍 [DEBUG] Verificando existencia del job en DB...`);
    const jobCheck = await pool.query(
      "SELECT id, status FROM jobs WHERE id = $1",
      [jobId],
    );
    if (jobCheck.rows.length === 0) {
      console.log(`⚠️  Job eliminado, ignorando`);
      console.log(
        `🔍 [DEBUG] EDGE CASE: Job no encontrado en DB, fue cancelado antes de procesarse`,
      );
      return;
    }

    const currentStatus = jobCheck.rows[0].status;
    console.log(`🔍 [DEBUG] Status actual del job en DB: ${currentStatus}`);

    // Si está en queued, promover a pending
    if (currentStatus === "queued") {
      console.log(`🔍 [DEBUG] Promoviendo job de 'queued' a 'pending'...`);
      await updateJob(jobId, { status: "pending" });
      console.log(`✅ [DEBUG] Job promovido a 'pending'`);
    }

    // Actualizar status a processing
    console.log(
      `🔍 [DEBUG] Actualizando job a 'processing' con PID ${process.pid}...`,
    );
    await updateJob(jobId, {
      status: "processing",
      progress: 0,
      pid: process.pid,
    });
    console.log(`✅ [DEBUG] Job actualizado a 'processing'`);

    // Obtener flujo de procesamiento según tipo
    const flow = PROCESSING_FLOWS[fileType];
    if (!flow) {
      console.log(
        `🔍 [DEBUG] EDGE CASE: Tipo de archivo no soportado: ${fileType}`,
      );
      throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }
    console.log(
      `🔍 [DEBUG] Flujo de procesamiento obtenido: ${flow.length} pasos`,
    );

    // Procesar cada paso del flujo
    for (let i = 0; i < flow.length; i++) {
      const { step, duration, progress } = flow[i];
      console.log(`🔍 [DEBUG] Iniciando paso ${i + 1}/${flow.length}: ${step}`);

      // Verificar cancelación
      console.log(`🔍 [DEBUG] Verificando si el job fue cancelado...`);
      if (await isJobCancelled(jobId)) {
        console.log(`⚠️  Cancelado`);
        console.log(
          `🔍 [DEBUG] EDGE CASE: Job cancelado durante procesamiento en paso '${step}'`,
        );
        return;
      }
      console.log(`✅ [DEBUG] Job no cancelado, continuando...`);

      // Simular error si se especificó testErrorType
      if (testErrorType && ERROR_SIMULATIONS[testErrorType]) {
        console.log(`🔍 [DEBUG] testErrorType detectado: ${testErrorType}`);
        const errorConfig = ERROR_SIMULATIONS[testErrorType];
        if (
          errorConfig.step === step ||
          (errorConfig.step === "random" && Math.random() > 0.5)
        ) {
          console.log(`❌ Error simulado: ${testErrorType}`);
          console.log(`🔍 [DEBUG] EDGE CASE: Error simulado en paso '${step}'`);
          await updateJob(jobId, {
            status: "error",
            error_type: errorConfig.type,
            error_message: errorConfig.message,
            step,
            progress,
          });
          console.log(`✅ [DEBUG] Job actualizado con error en DB`);
          return;
        }
      }

      // Actualizar paso actual
      console.log(`   📍 ${step} (${progress}%)`);
      console.log(
        `🔍 [DEBUG] Actualizando DB: step='${step}', progress=${progress}`,
      );
      await updateJob(jobId, { step, progress });
      console.log(`✅ [DEBUG] DB actualizada correctamente`);

      // Simular duración del paso
      console.log(`🔍 [DEBUG] Simulando procesamiento por ${duration}ms...`);
      await new Promise((resolve) => setTimeout(resolve, duration));
      console.log(`✅ [DEBUG] Paso '${step}' completado`);
    }

    // Marcar como completado
    console.log(
      `🔍 [DEBUG] Todos los pasos completados, marcando job como 'done'...`,
    );
    await updateJob(jobId, {
      status: "done",
      step: "done",
      progress: 100,
    });
    console.log(`✅ [DEBUG] Job marcado como 'done' en DB`);
    const totalTime = Date.now() - startTime;
    console.log(`⏱️  [DEBUG] Tiempo total de procesamiento: ${totalTime}ms`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`🔍 [DEBUG] Stack trace:`, error.stack);
    console.log(`🔍 [DEBUG] EDGE CASE: Error inesperado durante procesamiento`);
    await updateJob(jobId, {
      status: "error",
      error_type: "connection_error",
      error_message: error.message,
    });
    console.log(`✅ [DEBUG] Error guardado en DB`);
  }
}

// Iniciar worker
async function startWorker() {
  console.log("🚀 Iniciando worker de procesamiento de archivos...");

  const boss = new PgBoss({
    connectionString: DATABASE_URL,
    retryLimit: 2,
    retryDelay: 5,
    retryBackoff: true,
    noScheduling: false,
    // Configuración de polling agresivo
    newJobCheckInterval: 100,
    newJobCheckIntervalSeconds: undefined,
    // DESHABILITAR mantenimiento automático que causa delays
    noSupervisor: true, // Deshabilitar supervisor interno
    noScheduling: true, // Deshabilitar scheduling
    // Limpieza inmediata de jobs completados
    deleteAfterSeconds: 60, // Eliminar jobs después de 1 minuto
    archiveCompletedAfterSeconds: undefined, // No archivar
  });

  boss.on("error", (error) => {
    console.error("❌ Error en pg-boss:", error);
  });

  await boss.start();
  console.log("✅ pg-boss iniciado correctamente");
  console.log(
    "⚙️ [Worker] Configuración: newJobCheckInterval=100ms, noSupervisor=true, deleteAfter=60s",
  );

  // Asegurar que la cola process-file exista
  try {
    await boss.createQueue("process-file");
    console.log("✅ Cola process-file creada/verificada");
  } catch (error) {
    // La cola puede ya existir, ignoramos el error
    console.log(
      "ℹ️ Cola process-file ya existe o no requiere creación explícita",
    );
  }

  // Registrar worker para procesar jobs
  console.log("🔧 [Worker] Registrando handler para cola 'process-file'...");
  console.log(
    `🔍 [DEBUG] Configuración del worker: teamSize=5, teamConcurrency=1`,
  );
  let lastJobTime = Date.now();

  await boss.work(
    "process-file",
    {
      teamSize: 5,
      teamConcurrency: 1,
      newJobCheckInterval: 100,
    },
    async (jobs) => {
      const now = Date.now();
      const timeSinceLastJob = now - lastJobTime;
      lastJobTime = now;

      console.log(`\n${"=".repeat(80)}`);
      console.log(
        `🔔 [${new Date().toISOString()}] NUEVO JOB RECIBIDO DE PG-BOSS`,
      );
      console.log(
        `⏱️  Tiempo desde último job: ${timeSinceLastJob}ms (${(timeSinceLastJob / 1000).toFixed(2)}s)`,
      );
      console.log(`${"=".repeat(80)}`);
      console.log(
        `🔍 [DEBUG] Tipo de jobs recibido:`,
        Array.isArray(jobs) ? "Array" : "Single",
      );

      // pg-boss puede enviar un array de jobs o un solo job
      const jobArray = Array.isArray(jobs) ? jobs : [jobs];
      console.log(`🔍 [DEBUG] Cantidad de jobs a procesar: ${jobArray.length}`);

      for (const job of jobArray) {
        console.log(`🆔 Job ID: ${job.data.jobId}`);
        console.log(`📦 Tipo: ${job.data.fileType}`);
        console.log(`📁 Categoría: ${job.data.categoryId}`);
        console.log(`🔍 [DEBUG] pg-boss job ID interno: ${job.id}`);
        console.log(
          `🔍 [DEBUG] Datos completos del job:`,
          JSON.stringify(job.data, null, 2),
        );

        try {
          console.log(`🔍 [DEBUG] Llamando a processFile()...`);
          await processFile(job);
          console.log(`\n✅ JOB COMPLETADO: ${job.data.jobId}`);
          console.log(`🔍 [DEBUG] processFile() terminó exitosamente`);
        } catch (error) {
          console.error(`\n❌ JOB FALLÓ: ${job.data.jobId}`, error.message);
          console.error(`🔍 [DEBUG] Error stack:`, error.stack);
          console.log(
            `🔍 [DEBUG] EDGE CASE: Error no capturado en processFile()`,
          );
          throw error;
        }
      }

      console.log(`\n${"=".repeat(80)}`);
      console.log(`⏸️  ESPERANDO SIGUIENTE JOB...`);
      console.log(`${"=".repeat(80)}\n`);
    },
  );

  console.log("✅ [Worker] Handler registrado exitosamente");

  console.log("✅ Worker registrado y esperando jobs...\n");

  // Manejar shutdown gracefully
  process.once("SIGINT", async () => {
    console.log("\n⏹️  Deteniendo worker...");
    await boss.stop();
    await pool.end();
    console.log("✅ Worker detenido correctamente");
    process.exit(0);
  });

  process.once("SIGTERM", async () => {
    console.log("\n⏹️  Deteniendo worker...");
    await boss.stop();
    await pool.end();
    console.log("✅ Worker detenido correctamente");
    process.exit(0);
  });
}

// Iniciar
startWorker().catch((error) => {
  console.error("❌ Error fatal al iniciar worker:", error);
  process.exit(1);
});
