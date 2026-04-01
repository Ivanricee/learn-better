import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import pkg from "pg";
const { Pool } = pkg;

/**
 * Vectoriza la transcripción completa guardando cada segmento como documento.
 * - columna `metadata`: { segment_start, segment_end, chunk_index }
 * - columna `fk_metadata`: { file_id, category_id, source_url }
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

  // Construir documentos: un documento por segmento
  const documents = segments.map((seg, i) => ({
    pageContent: seg.text,
    metadata: {
      segment_start: seg.start,
      segment_end: seg.end,
      chunk_index: i,
    },
  }));

  // addDocuments retorna los IDs insertados
  const insertedIds = await vectorStore.addDocuments(documents);

  // Actualizar fk_metadata en cada documento insertado
  // PGVectorStore no maneja columnas extra, así que lo hacemos con un UPDATE directo
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const fkMetadata = JSON.stringify({
    file_id: fileId,
    category_id: categoryId,
    source_url: sourceUrl || null,
  });

  try {
    for (const id of insertedIds) {
      await pool.query("UPDATE documents SET fk_metadata = $1 WHERE id = $2", [
        fkMetadata,
        id,
      ]);
    }
    console.log(
      `✅ [Vectorize] ${insertedIds.length} segmentos vectorizados para file_id=${fileId}`,
    );
  } finally {
    await pool.end();
    await vectorStore.end();
  }
}
