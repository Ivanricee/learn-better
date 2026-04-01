import pdfParse from "pdf-parse";
import { readFile } from "fs/promises";
import { vectorizeText } from "../lib/vectorize.js";

/**
 * Handler para archivos PDF.
 * Pipeline: pdf-parse → vectorizeText con chunking automático
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string} params.storagePath - Ruta local del PDF subido
 * @param {Function} params.updateJob
 * @param {Function} params.isJobCancelled
 */
export async function processPdfFile({
  jobId,
  fileId,
  categoryId,
  storagePath,
  updateJob,
  isJobCancelled,
}) {
  try {
    await updateJob(jobId, { step: "extracting", progress: 10 });

    const dataBuffer = await readFile(storagePath);
    const pdfData = await pdfParse(dataBuffer);

    if (await isJobCancelled(jobId)) return;

    await updateJob(jobId, { step: "vectorizing", progress: 50 });

    await vectorizeText({
      text: pdfData.text,
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
