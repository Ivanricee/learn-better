import fs from "fs/promises";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const filePath = `/tmp/${id}.opus`;

  try {
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "audio/ogg",
        "Content-Disposition": `attachment; filename="audio.opus"`,
      },
    });
  } catch {
    return Response.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
