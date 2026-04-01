import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import pkg from "pg";
const { Pool } = pkg;

/**
 * Vectoriza la transcripción completa guardando cada segmento como documento.
 * Cada documento incluye en metadata: file_id, category_id, source_url,
 * segment_start, segment_end, chunk_index
 *
 * @param {object} params
 * @param {Array<{ start: number, end: number, text: string }>} params.segments
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {string|null} params.sourceUrl
 * @returns {Promise<void>}
 */
export async function vectorizeTranscription({
  segments,
  fileId,
  categoryId,
  sourceUrl,
}) {
  if (!segments || segments.length === 0) {
    console.log("⚠️ [Vectorize] No hay segmentos para vectorizar");
    return;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY,
    outputDimensionality: 768,
  });

  const config = {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: "documents",
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
  };

  const vectorStore = await PGVectorStore.initialize(embeddings, config);

  // Construir documentos: un documento por segmento
  // Incluir file_id, category_id y source_url directamente en metadata
  const documents = segments.map((seg, i) => ({
    pageContent: seg.text,
    metadata: {
      file_id: fileId,
      category_id: categoryId,
      source_url: sourceUrl || null,
      segment_start: seg.start,
      segment_end: seg.end,
      chunk_index: i,
    },
  }));

  // Insertar documentos con metadata completo
  await vectorStore.addDocuments(documents);

  console.log(
    `✅ [Vectorize] ${documents.length} segmentos vectorizados para file_id=${fileId}`,
  );

  await vectorStore.end();
}
