
import { getVectorStore } from "@/app/src/lib/vectorStore";
import { NextResponse } from "next/server";

export async function POST() {
  const vectorStore = await getVectorStore();

  await vectorStore.addDocuments([
    {
      pageContent: "LangChain es un framework para construir aplicaciones con LLMs.",
      metadata: { source: "prueba", page: 1 },
    },
    {
      pageContent: "pgvector permite guardar y buscar vectores en PostgreSQL.",
      metadata: { source: "prueba", page: 2 },
    },
    {
      pageContent: "Next.js es un framework de React para aplicaciones web.",
      metadata: { source: "prueba", page: 3 },
    },
  ]);

  return NextResponse.json({ ok: true, message: "Documentos guardados" });
}