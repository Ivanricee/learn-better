import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { enqueueFileProcessing } from "@/lib/job-queue";

// Tipos de archivo aceptados por MIME type
const MIME_TO_TYPE: Record<string, string> = {
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "video/x-msvideo": "video",
  "audio/mpeg": "audio",
  "audio/mp4": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "audio/x-m4a": "audio",
  "audio/flac": "audio",
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "text/plain": "text",
  "text/markdown": "markdown",
};

function getFileType(file: File): string | null {
  // Intentar por MIME type
  const byMime = MIME_TO_TYPE[file.type];
  if (byMime) return byMime;

  // Intentar por extensión como fallback
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const byExt: Record<string, string> = {
    mp4: "video",
    webm: "video",
    mov: "video",
    avi: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    m4a: "audio",
    flac: "audio",
    pdf: "pdf",
    jpg: "image",
    jpeg: "image",
    png: "image",
    webp: "image",
    gif: "image",
    txt: "text",
    md: "markdown",
  };

  return byExt[ext] || null;
}

function getUrlType(url: string): string | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return null;
}

// POST /api/upload - Acepta multipart/form-data con file o sourceUrl + categoryId + name
export async function POST(request: NextRequest) {
  const t0 = Date.now();
  const elapsed = (label: string) =>
    console.log(`⏱️ [upload] ${label}: +${Date.now() - t0}ms`);
  try {
    const formData = await request.formData();
    elapsed("formData parsed");
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;
    const sourceUrl = formData.get("sourceUrl") as string | null;
    const nameOverride = formData.get("name") as string | null;
    const testErrorType = formData.get("testErrorType") as string | null;

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId es requerido" },
        { status: 400 },
      );
    }

    // Verificar que la categoría existe (tambien borrar en cascada.)
    const categoryExists = await query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId],
    );
    elapsed("category check");
    if (categoryExists.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    let fileId: string;
    let fileType: string;
    let fileName: string;

    // Caso 1: Archivo local
    if (file && file.size > 0) {
      const detectedType = getFileType(file);
      if (!detectedType) {
        return NextResponse.json(
          { error: `Tipo de archivo no soportado: ${file.type || file.name}` },
          { status: 400 },
        );
      }
      fileType = detectedType;
      fileName = nameOverride || file.name;

      // Guardar en UPLOAD_DIR/uuid-originalname
      const uploadsDir =
        process.env.UPLOADS_PATH || join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = join(
        uploadsDir,
        `${randomUUID()}-${safeOriginalName}`,
      );

      const bytes = await file.arrayBuffer();
      await writeFile(storagePath, Buffer.from(bytes));

      const fileResult = await query<{ id: string }>(
        `INSERT INTO files (category_id, name, original_name, type, mime_type, size_bytes, storage_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          categoryId,
          fileName,
          file.name,
          fileType,
          file.type,
          file.size,
          storagePath,
        ],
      );
      fileId = fileResult.rows[0].id;
      elapsed("file saved + DB insert");
    }
    // Caso 2: URL (YouTube, TikTok, Instagram)
    else if (sourceUrl) {
      const detectedType = getUrlType(sourceUrl);
      if (!detectedType) {
        return NextResponse.json(
          {
            error: "URL no soportada. Se aceptan YouTube, TikTok e Instagram.",
          },
          { status: 400 },
        );
      }
      fileType = detectedType;

      // Extraer nombre legible de la URL
      const urlObj = new URL(sourceUrl);
      fileName =
        nameOverride ||
        urlObj.searchParams.get("v") ||
        urlObj.pathname.split("/").filter(Boolean).pop() ||
        "video";

      const fileResult = await query<{ id: string }>(
        `INSERT INTO files (category_id, name, type, source_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [categoryId, fileName, fileType, sourceUrl],
      );
      fileId = fileResult.rows[0].id;
      elapsed("URL DB insert");
    } else {
      return NextResponse.json(
        { error: "Se requiere un archivo (file) o una URL (sourceUrl)" },
        { status: 400 },
      );
    }

    // Crear job con status 'queued' - SIEMPRE queued
    // El worker se encarga de promover jobs a pending según sea necesario
    const jobResult = await query<{ id: string }>(
      `INSERT INTO jobs (file_id, category_id, status)
       VALUES ($1, $2, 'queued')
       RETURNING id`,
      [fileId, categoryId],
    );
    const jobId = jobResult.rows[0].id;
    elapsed("job DB insert");

    // Encolar en pg-boss — teamConcurrency:1 garantiza procesamiento secuencial
    await enqueueFileProcessing({
      jobId,
      fileId,
      categoryId,
      fileType,
      testErrorType: testErrorType || undefined,
    });
    elapsed("pg-boss enqueue");

    return NextResponse.json(
      { jobId, fileId, fileName, fileType },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      { error: "Error al subir archivo" },
      { status: 500 },
    );
  }
}
