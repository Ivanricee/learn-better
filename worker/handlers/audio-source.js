import { unlink } from "fs/promises";
import { downloadAudio } from "../lib/ytdlp-utils.js";
import { getAudioDuration } from "../lib/ffmpeg-utils.js";
import {
  chunkAudioFile,
  transcribeAll,
  fixOverlap,
  MAX_DURATION_SECONDS,
} from "../lib/groq-whisper.js";
import { vectorizeTranscription } from "../lib/vectorize.js";

/**
 * Handler para tipos: youtube | tiktok | instagram
 * Pipeline: yt-dlp → OGG → validar duración → chunking → Whisper → vectorizar
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string} params.sourceUrl
 * @param {Function} params.updateJob   - async (updates) => void
 * @param {Function} params.isJobCancelled - async () => boolean
 * @param {object}  params.pool         - pg Pool para queries
 */
export async function processAudioSource({
  jobId,
  fileId,
  categoryId,
  sourceUrl,
  updateJob,
  isJobCancelled,
  pool,
}) {
  let oggPath = null;

  try {
    // 1. Descargar audio con yt-dlp
    await updateJob(jobId, { step: "downloading", progress: 5 });
    const { pid, oggPath: downloadedPath } = await downloadAudio(sourceUrl);
    oggPath = downloadedPath;
    await updateJob(jobId, { pid, step: "downloading", progress: 15 });

    if (await isJobCancelled(jobId)) return;

    // 2. Validar duración
    const durationSec = await getAudioDuration(oggPath);
    if (durationSec > MAX_DURATION_SECONDS) {
      await unlink(oggPath).catch(() => {});
      await updateJob(jobId, {
        status: "error",
        error_type: "audio_too_long",
        error_message: "El audio es demasiado largo (>2 horas)",
        step: "downloading",
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

    // 4. Eliminar archivo temporal principal
    await unlink(oggPath).catch(() => {});
    oggPath = null;

    if (await isJobCancelled(jobId)) return;

    // 5. Vectorizar
    await updateJob(jobId, { step: "vectorizing", progress: 80 });
    await vectorizeTranscription({ segments, fileId, categoryId, sourceUrl });

    // 6. Done
    await updateJob(jobId, {
      status: "done",
      step: "done",
      progress: 100,
    });
  } catch (err) {
    // Limpiar archivo temporal si quedó
    if (oggPath) await unlink(oggPath).catch(() => {});

    const errorType =
      err.code === "whisper_quota"
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
