import PgBoss from "pg-boss";
import pkg from "pg";
const { Pool } = pkg;

import { processAudioSource } from "./handlers/audio-source.js";
import { processVideoFile } from "./handlers/video-file.js";
import { processAudioFile } from "./handlers/audio-file.js";

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
  return result.rows.length === 0;
}

// Obtiene datos del archivo desde la DB
async function getFileData(fileId) {
  const result = await pool.query(
    "SELECT storage_path, source_url, type FROM files WHERE id = $1",
    [fileId],
  );
  if (result.rows.length === 0) {
    throw new Error(`Archivo no encontrado en DB: ${fileId}`);
  }
  return result.rows[0];
}

// Flujos simulados para tipos aún no implementados (fases futuras)
const PROCESSING_FLOWS_DUMMY = {
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

// Procesamiento dummy para tipos aún no reales
async function processDummy(jobId, fileType) {
  const flow = PROCESSING_FLOWS_DUMMY[fileType];
  if (!flow) throw new Error(`Tipo de archivo no soportado: ${fileType}`);

  for (const { step, duration, progress } of flow) {
    if (await isJobCancelled(jobId)) return;
    await updateJob(jobId, { step, progress });
    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  await updateJob(jobId, { status: "done", step: "done", progress: 100 });
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
  });

  try {
    // Verificar que el job existe
    const jobCheck = await pool.query(
      "SELECT id, status FROM jobs WHERE id = $1",
      [jobId],
    );
    if (jobCheck.rows.length === 0) {
      console.log(`⚠️  Job eliminado, ignorando`);
      return;
    }

    const currentStatus = jobCheck.rows[0].status;

    // Promover de queued → pending
    if (currentStatus === "queued") {
      await updateJob(jobId, { status: "pending" });
    }

    // Marcar como processing con PID del proceso worker
    await updateJob(jobId, {
      status: "processing",
      progress: 0,
      pid: process.pid,
    });

    // Dispatch por tipo
    const audioSourceTypes = ["youtube", "tiktok", "instagram"];
    const isAudioSource = audioSourceTypes.includes(fileType);
    const isVideo = fileType === "video";
    const isAudio = fileType === "audio";

    if (isAudioSource) {
      const { source_url } = await getFileData(fileId);
      await processAudioSource({
        jobId,
        fileId,
        categoryId,
        sourceUrl: source_url,
        updateJob,
        isJobCancelled,
        pool,
      });
    } else if (isVideo) {
      const { storage_path } = await getFileData(fileId);
      await processVideoFile({
        jobId,
        fileId,
        categoryId,
        storagePath: storage_path,
        updateJob,
        isJobCancelled,
      });
    } else if (isAudio) {
      const { storage_path } = await getFileData(fileId);
      await processAudioFile({
        jobId,
        fileId,
        categoryId,
        storagePath: storage_path,
        updateJob,
        isJobCancelled,
      });
    } else {
      // Tipos aún en simulación: pdf, image, text, markdown
      await processDummy(jobId, fileType);
    }

    const totalTime = Date.now() - startTime;
    console.log(`⏱️  [DEBUG] Tiempo total de procesamiento: ${totalTime}ms`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`🔍 [DEBUG] Stack trace:`, error.stack);
    // Los handlers ya actualizan el job con el error específico antes de re-throw.
    // Solo actualizamos si no fue un error ya registrado.
    const jobState = await pool.query("SELECT status FROM jobs WHERE id = $1", [
      jobId,
    ]);
    if (jobState.rows[0]?.status !== "error") {
      await updateJob(jobId, {
        status: "error",
        error_type: "connection_error",
        error_message: error.message,
      });
    }
  }
}

// Iniciar worker
export async function startWorker() {
  console.log("🚀 Iniciando worker de procesamiento de archivos...");

  const boss = new PgBoss({
    connectionString: DATABASE_URL,
    retryLimit: 2,
    retryDelay: 5,
    retryBackoff: true,
    noScheduling: true,
    noSupervisor: true,
    newJobCheckInterval: 100,
    deleteAfterSeconds: 60,
    archiveCompletedAfterSeconds: undefined,
  });

  boss.on("error", (error) => {
    console.error("❌ Error en pg-boss:", error);
  });

  await boss.start();
  console.log("✅ pg-boss iniciado correctamente");

  // Asegurar que la cola exista
  try {
    await boss.createQueue("process-file");
    console.log("✅ Cola process-file creada/verificada");
  } catch {
    console.log(
      "ℹ️ Cola process-file ya existe o no requiere creación explícita",
    );
  }

  console.log("🔧 [Worker] Registrando handler para cola 'process-file'...");
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

      const jobArray = Array.isArray(jobs) ? jobs : [jobs];

      for (const job of jobArray) {
        console.log(`🆔 Job ID: ${job.data.jobId}`);
        console.log(`📦 Tipo: ${job.data.fileType}`);
        console.log(`📁 Categoría: ${job.data.categoryId}`);

        try {
          await processFile(job);
          console.log(`\n✅ JOB COMPLETADO: ${job.data.jobId}`);
        } catch (error) {
          console.error(`\n❌ JOB FALLÓ: ${job.data.jobId}`, error.message);
          throw error;
        }
      }

      console.log(`\n${"=".repeat(80)}`);
      console.log(`⏸️  ESPERANDO SIGUIENTE JOB...`);
      console.log(`${"=".repeat(80)}\n`);
    },
  );

  console.log("✅ Worker registrado y esperando jobs...\n");

  // Graceful shutdown
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
