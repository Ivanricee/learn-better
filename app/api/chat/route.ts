import { getVectorStore } from "@/app/src/lib/vectorStore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  //return NextResponse.json({ ok: true, message: "Ruta funcionando" });
  const { question } = await req.json();

  const vectorStore = await getVectorStore();

  const results = await vectorStore.similaritySearch(question, 3);

  return NextResponse.json({
    results: results.map((r) => ({
      content: r.pageContent,
      metadata: r.metadata,
    })),
  });
}
