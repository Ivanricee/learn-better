import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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

  // Filtrar segmentos con texto vacío o muy corto (menos de 3 caracteres)
  const validSegments = segments.filter(
    (seg) => seg.text && seg.text.trim().length >= 3,
  );

  if (validSegments.length === 0) {
    console.log("⚠️ [Vectorize] Todos los segmentos están vacíos");
    return;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
    outputDimensionality: 768, //not working
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

  // Construir documentos: un documento por segmento válido
  // Incluir file_id, category_id y source_url directamente en metadata
  const documents = validSegments.map((seg, i) => ({
    pageContent: seg.text.trim(),
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

/**
 * Vectoriza texto plano dividiéndolo en chunks automáticamente.
 * Usado para PDF, text, markdown e image (descripción).
 *
 * @param {object} params
 * @param {string} params.text - Texto completo a vectorizar
 * @param {string} params.fileId
 * @param {string} params.categoryId
 * @param {number} params.chunkSize - Tamaño de cada chunk (default: 1000)
 * @param {number} params.chunkOverlap - Overlap entre chunks (default: 200)
 * @returns {Promise<void>}
 */
export async function vectorizeText({
  text,
  fileId,
  categoryId,
  chunkSize = 1000,
  chunkOverlap = 200,
}) {
  if (!text || text.trim().length === 0) {
    console.log("⚠️ [Vectorize] Texto vacío, nada que vectorizar");
    return;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitText(text);

  if (chunks.length === 0) {
    console.log("⚠️ [Vectorize] No se generaron chunks");
    return;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001",
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

  const documents = chunks.map((chunk, i) => ({
    pageContent: chunk,
    metadata: {
      file_id: fileId,
      category_id: categoryId,
      source_url: null,
      chunk_index: i,
    },
  }));

  await vectorStore.addDocuments(documents);

  console.log(
    `✅ [Vectorize] ${chunks.length} chunks vectorizados para file_id=${fileId}`,
  );

  await vectorStore.end();
}
