import { extractImageDescription } from "../lib/gemini-vision.js";
import { vectorizeText } from "../lib/vectorize.js";

/**
 * Handler para archivos de imagen.
 * Pipeline: Gemini Vision → descripción → vectorizeText
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string} params.storagePath - Ruta local de la imagen subida
 * @param {Function} params.updateJob
 * @param {Function} params.isJobCancelled
 */
export async function processImageFile({
  jobId,
  fileId,
  categoryId,
  storagePath,
  updateJob,
  isJobCancelled,
}) {
  try {
    await updateJob(jobId, { step: "extracting", progress: 10 });

    const description = await extractImageDescription(storagePath);

    if (await isJobCancelled(jobId)) return;

    await updateJob(jobId, { step: "vectorizing", progress: 60 });

    await vectorizeText({
      text: description,
      fileId,
      categoryId,
      chunkSize: 2000,
    });

    await updateJob(jobId, { status: "done", step: "done", progress: 100 });
  } catch (err) {
    const errorType =
      err.message.includes("quota") || err.message.includes("429")
        ? "connection_error"
        : "extraction_failed";

    await updateJob(jobId, {
      status: "error",
      error_type: errorType,
      error_message: err.message,
    });
    throw err;
  }
}
