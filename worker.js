// Worker independiente para procesamiento de archivos
// Ejecutar con: node worker.js o npm run worker

import dotenv from "dotenv";

// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV !== "production") {
  // En desarrollo, cargar .env.local
  dotenv.config({ path: ".env.local" });
} else {
  // En producción, cargar .env si existe (fallback)
  dotenv.config();
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

// Helper: marcar siguiente job como pending
async function markNextJobAsPending(categoryId) {
  const result = await pool.query(
    `SELECT id FROM jobs
     WHERE category_id = $1 AND status = 'queued'
     ORDER BY created_at ASC
     LIMIT 1`,
    [categoryId],
  );

  if (result.rows.length > 0) {
    const nextJobId = result.rows[0].id;
    await pool.query("UPDATE jobs SET status = 'pending' WHERE id = $1", [
      nextJobId,
    ]);
    console.log(`✅ Job ${nextJobId} marcado como pending`);
  }
}

// Función principal de procesamiento
async function processFile(job) {
  const { jobId, fileId, categoryId, fileType, testErrorType } = job.data;

  const startTime = Date.now();
  console.log(
    `\n🔄 [${new Date().toISOString()}] Procesando job ${jobId} (tipo: ${fileType})`,
  );

  try {
    // Actualizar status a processing
    console.log(`⚙️ [Worker] Actualizando job ${jobId} a status: processing`);
    await updateJob(jobId, { status: "processing", progress: 0 });
    console.log(
      `✅ [Worker] Job ${jobId} actualizado a processing (${Date.now() - startTime}ms)`,
    );

    // Obtener flujo de procesamiento según tipo
    const flow = PROCESSING_FLOWS[fileType];
    if (!flow) {
      throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }

    // Procesar cada paso del flujo
    for (let i = 0; i < flow.length; i++) {
      const { step, duration, progress } = flow[i];

      // Verificar cancelación
      if (await isJobCancelled(jobId)) {
        console.log(`⚠️ Job ${jobId} cancelado`);
        await markNextJobAsPending(categoryId);
        return;
      }

      // Simular error si se especificó testErrorType
      if (testErrorType && ERROR_SIMULATIONS[testErrorType]) {
        const errorConfig = ERROR_SIMULATIONS[testErrorType];
        if (
          errorConfig.step === step ||
          (errorConfig.step === "random" && Math.random() > 0.5)
        ) {
          console.log(`❌ Simulando error: ${testErrorType}`);
          await updateJob(jobId, {
            status: "error",
            error_type: errorConfig.type,
            error_message: errorConfig.message,
            step,
            progress,
          });
          await markNextJobAsPending(categoryId);
          return;
        }
      }

      // Actualizar paso actual
      console.log(`  📍 ${step} (${progress}%)`);
      await updateJob(jobId, { step, progress });

      // Simular duración del paso
      await new Promise((resolve) => setTimeout(resolve, duration));
    }

    // Marcar como completado
    await updateJob(jobId, {
      status: "done",
      step: "done",
      progress: 100,
    });

    console.log(`✅ Job ${jobId} completado exitosamente`);

    // Marcar siguiente job como pending
    await markNextJobAsPending(categoryId);
  } catch (error) {
    console.error(`❌ Error procesando job ${jobId}:`, error);
    await updateJob(jobId, {
      status: "error",
      error_type: "connection_error",
      error_message: error.message,
    });
    await markNextJobAsPending(categoryId);
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
    // Configuración de polling para reducir latencia al mínimo
    newJobCheckInterval: 100, // Revisar nuevos jobs cada 100ms (mínimo permitido)
    newJobCheckIntervalSeconds: undefined, // Desactivar el intervalo en segundos
    // Reducir intervalos de mantenimiento para evitar interferencia
    maintenanceIntervalSeconds: 120, // Mantenimiento cada 2 minutos en lugar de 1
    archiveCompletedAfterSeconds: 3600, // Archivar después de 1 hora
  });

  boss.on("error", (error) => {
    console.error("❌ Error en pg-boss:", error);
  });

  await boss.start();
  console.log("✅ pg-boss iniciado correctamente");
  console.log(
    "⚙️ [Worker] Configuración de polling: newJobCheckInterval = 100ms (mínimo)",
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
  await boss.work(
    "process-file",
    {
      teamSize: 5,
      teamConcurrency: 1,
      newJobCheckInterval: 100, // Revisar cola cada 100ms (mínimo permitido)
    },
    async (jobs) => {
      // pg-boss puede enviar un array de jobs o un solo job
      const jobArray = Array.isArray(jobs) ? jobs : [jobs];

      for (const job of jobArray) {
        console.log(
          `\n📨 [${new Date().toISOString()}] [Worker] Job recibido de pg-boss:`,
          job.id,
        );
        console.log("📦 [Worker] Data:", job.data);
        console.log(`⏱️ [Worker] Iniciando procesamiento inmediatamente...`);
        await processFile(job);
      }
    },
  );

  console.log("✅ Worker registrado y esperando jobs...\n");

  // Manejar shutdown gracefully
  process.on("SIGINT", async () => {
    console.log("\n⏹️  Deteniendo worker...");
    await boss.stop();
    await pool.end();
    console.log("✅ Worker detenido correctamente");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
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
