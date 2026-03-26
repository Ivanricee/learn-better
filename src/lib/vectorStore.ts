// Importa la clase que sabe hablar con PostgreSQL + pgvector
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
// Importa el modelo de Google que convierte texto en vectores numéricos
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getVectorStore() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY!,
  });
  // Crea el "convertidor" de texto a vectores
  const config = {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL!,
    },
    tableName: "documents", // nombre de la tabla que se creará en tu DB
    columns: {
      idColumnName: "id", // columna para el ID único
      vectorColumnName: "embedding", // columna donde van los vectores
      contentColumnName: "content", // columna donde va el texto original
      metadataColumnName: "metadata", // columna para info extra (título, fuente, etc)
    },
  };

  return await PGVectorStore.initialize(embeddings, config);
}
