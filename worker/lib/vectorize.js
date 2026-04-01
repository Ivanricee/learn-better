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

  // Validar que la API key esté definida
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(
      "❌ GOOGLE_API_KEY no está definida en las variables de entorno",
    );
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
    modelName: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY,
    outputDimensionality: 768,
  });

  // DEBUG: verificar que los embeddings se generan correctamente
  console.log("🔍 [Vectorize] Probando embedding de un segmento de muestra...");
  try {
    const testEmbedding = await embeddings.embedQuery(
      validSegments[0].text.trim(),
    );
    console.log(
      `✅ [Vectorize] Embedding generado OK: dimensiones=${testEmbedding.length}, primer_valor=${testEmbedding[0]}`,
    );
    if (testEmbedding.length === 0) {
      throw new Error(
        "El embedding devuelto tiene 0 dimensiones. Verifica el modelo y la API key.",
      );
    }
  } catch (err) {
    console.error(
      "❌ [Vectorize] Falló la generación del embedding de prueba:",
      err.message,
    );
    throw err;
  }

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

  // Generar embeddings manualmente para validar antes de insertar
  console.log(
    `🔍 [Vectorize] Generando embeddings para ${documents.length} segmentos...`,
  );
  const texts = documents.map((d) => d.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // Filtrar cualquier embedding vacío o inválido
  const validPairs = vectors
    .map((vec, i) => ({ vec, doc: documents[i] }))
    .filter(({ vec }) => vec && vec.length > 0);

  if (validPairs.length === 0) {
    throw new Error(
      "❌ [Vectorize] Ningún embedding fue generado correctamente. Abortando inserción.",
    );
  }

  if (validPairs.length !== documents.length) {
    console.warn(
      `⚠️ [Vectorize] ${documents.length - validPairs.length} segmentos descartados por embedding vacío`,
    );
  }

  // Insertar solo los pares con embeddings válidos
  await vectorStore.addVectors(
    validPairs.map((p) => p.vec),
    validPairs.map((p) => p.doc),
  );

  console.log(
    `✅ [Vectorize] ${validPairs.length} segmentos vectorizados para file_id=${fileId}`,
  );

  await vectorStore.end();
}
