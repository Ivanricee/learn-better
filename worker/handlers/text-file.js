import { readFile } from "fs/promises";
import { vectorizeText } from "../lib/vectorize.js";

/**
 * Limpia sintaxis markdown básica para obtener texto plano.
 *
 * @param {string} text - Texto con sintaxis markdown
 * @returns {string} - Texto plano sin sintaxis
 */
function cleanMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

/**
 * Handler para archivos de texto plano y markdown.
 * Pipeline: readFile → limpiar markdown (si aplica) → vectorizeText
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string} params.storagePath - Ruta local del archivo
 * @param {string} params.fileType - 'text' o 'markdown'
 * @param {Function} params.updateJob
 * @param {Function} params.isJobCancelled
 */
export async function processTextFile({
  jobId,
  fileId,
  categoryId,
  storagePath,
  fileType,
  updateJob,
  isJobCancelled,
}) {
  try {
    await updateJob(jobId, { step: "extracting", progress: 10 });

    let text = await readFile(storagePath, "utf8");

    if (fileType === "markdown") {
      text = cleanMarkdown(text);
    }

    if (await isJobCancelled(jobId)) return;

    await updateJob(jobId, { step: "vectorizing", progress: 40 });

    await vectorizeText({
      text,
      fileId,
      categoryId,
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    await updateJob(jobId, { status: "done", step: "done", progress: 100 });
  } catch (err) {
    await updateJob(jobId, {
      status: "error",
      error_type: "extraction_failed",
      error_message: err.message,
    });
    throw err;
  }
}
