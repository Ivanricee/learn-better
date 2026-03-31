import { unlink } from "fs/promises";
import { convertToOgg, getAudioDuration } from "../lib/ffmpeg-utils.js";
import {
  chunkAudioFile,
  transcribeAll,
  fixOverlap,
  MAX_DURATION_SECONDS,
} from "../lib/groq-whisper.js";
import { vectorizeTranscription } from "../lib/vectorize.js";

/**
 * Handler para tipo: audio (archivo subido)
 * Pipeline: ffmpeg → OGG 24kbps → validar duración → chunking → Whisper → vectorizar
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string} params.storagePath - Ruta local del audio subido
 * @param {Function} params.updateJob
 * @param {Function} params.isJobCancelled
 */
export async function processAudioFile({
  jobId,
  fileId,
  categoryId,
  storagePath,
  updateJob,
  isJobCancelled,
}) {
  let oggPath = null;

  try {
    // 1. Convertir a OGG 24kbps mono (siempre, para consistencia de formato)
    await updateJob(jobId, { step: "converting", progress: 5 });
    const { pid, oggPath: convertedPath } = await convertToOgg(storagePath);
    oggPath = convertedPath;
    await updateJob(jobId, { pid, step: "converting", progress: 15 });

    if (await isJobCancelled(jobId)) {
      await unlink(oggPath).catch(() => {});
      return;
    }

    // 2. Validar duración
    const durationSec = await getAudioDuration(oggPath);
    if (durationSec > MAX_DURATION_SECONDS) {
      await unlink(oggPath).catch(() => {});
      await updateJob(jobId, {
        status: "error",
        error_type: "audio_too_long",
        error_message: "El audio es demasiado largo (>2 horas)",
        step: "converting",
        progress: 15,
      });
      return;
    }

    if (await isJobCancelled(jobId)) {
      await unlink(oggPath).catch(() => {});
      return;
    }

    // 3. Chunking + Whisper
    await updateJob(jobId, { step: "transcribing", progress: 20 });
    const chunks = await chunkAudioFile(oggPath);
    const rawResults = await transcribeAll(chunks);
    const { text, segments } = fixOverlap(rawResults);

    // 4. Eliminar archivo temporal
    await unlink(oggPath).catch(() => {});
    oggPath = null;

    if (await isJobCancelled(jobId)) return;

    // 5. Vectorizar
    await updateJob(jobId, { step: "vectorizing", progress: 80 });
    await vectorizeTranscription({
      segments,
      fileId,
      categoryId,
      sourceUrl: null,
    });

    // 6. Done
    await updateJob(jobId, {
      status: "done",
      step: "done",
      progress: 100,
    });
  } catch (err) {
    if (oggPath) await unlink(oggPath).catch(() => {});

    const errorType = err.code === "whisper_quota"
      ? "whisper_quota"
      : err.code === "conversion_failed"
        ? "conversion_failed"
        : "connection_error";

    await updateJob(jobId, {
      status: "error",
      error_type: errorType,
      error_message: err.message,
    });

    throw err;
  }
}
