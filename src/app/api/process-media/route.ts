import { execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import fs from "fs/promises";

const exec = promisify(execFile);

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url) {
    return Response.json({ error: "URL requerida" }, { status: 400 });
  }

  const id = randomUUID();
  const outputPath = `/tmp/${id}`;
  const finalPath = `${outputPath}.ogg`; // ← ogg en vez de opus

  try {
    await exec("yt-dlp", [
      url,
      "--extract-audio",
      "--audio-format",
      "ogg",
      "--audio-quality",
      "0",
      "--postprocessor-args",
      "ffmpeg:-ar 16000 -ac 1",
      "-o",
      outputPath,
    ]);

    const stats = await fs.stat(finalPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    // Validación: Groq tiene límite de 25MB
    if (stats.size > 25 * 1024 * 1024) {
      await fs.unlink(finalPath);
      return Response.json(
        { error: "Archivo muy grande (>25MB)" },
        { status: 413 },
      );
    }

    return Response.json({
      success: true,
      file: finalPath, // ← retorna la ruta completa con extensión
      sizeMB,
    });
  } catch (error: any) {
    // Cleanup en caso de error
    await fs.unlink(finalPath).catch(() => {});
    return Response.json({ error: error.message }, { status: 500 });
  }
}
