import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getVectorStore() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY!,
  });

  const config = {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL!,
    },
    tableName: "documents",
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
  };

  return await PGVectorStore.initialize(embeddings, config);
}
