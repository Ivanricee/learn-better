import { readFile } from "fs/promises";
import { extractText, getDocumentProxy } from "unpdf";
import { vectorizeText } from "../lib/vectorize.js";

/**
 * Handler para archivos PDF.
 * Pipeline: unpdf → vectorizeText con chunking automático
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

    const buffer = await readFile(storagePath);
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    console.log(`📄 [PDF] Total de páginas: ${totalPages}`);
    console.log(`📄 [PDF] Texto extraído: ${text.length} caracteres`);
    console.log(`📄 [PDF] Primeros 200 chars: ${text.substring(0, 200)}`);

    if (await isJobCancelled(jobId)) return;

    await updateJob(jobId, { step: "vectorizing", progress: 50 });

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
