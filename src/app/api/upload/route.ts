import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { query } from "@/lib/db";
import { enqueueFileProcessing } from "@/lib/job-queue";

// POST /api/upload - Subir archivo y crear job
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;
    const sourceUrl = formData.get("sourceUrl") as string | null;
    const testErrorType = formData.get("testErrorType") as string | null;

    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId es requerido" },
        { status: 400 },
      );
    }

    // Verificar que la categoría existe
    const categoryExists = await query(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId],
    );

    if (categoryExists.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    let fileId: string;
    let fileType: string;
    let fileName: string;

    // Caso 1: Archivo subido
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determinar tipo de archivo
      const mimeType = file.type;
      if (mimeType.startsWith("video/")) {
        fileType = "video";
      } else if (mimeType.startsWith("audio/")) {
        fileType = "audio";
      } else if (mimeType === "application/pdf") {
        fileType = "pdf";
      } else if (mimeType.startsWith("image/")) {
        fileType = "image";
      } else if (mimeType.startsWith("text/")) {
        fileType = file.name.endsWith(".md") ? "markdown" : "text";
      } else {
        return NextResponse.json(
          { error: "Tipo de archivo no soportado" },
          { status: 400 },
        );
      }

      // Guardar archivo en disco
      const uploadsDir =
        process.env.UPLOADS_PATH || join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = join(uploadsDir, `${timestamp}-${safeFileName}`);

      await writeFile(storagePath, buffer);

      // Crear registro en tabla files
      const fileResult = await query<{ id: string }>(
        `INSERT INTO files (category_id, name, original_name, type, mime_type, size_bytes, storage_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          categoryId,
          file.name,
          file.name,
          fileType,
          mimeType,
          file.size,
          storagePath,
        ],
      );

      fileId = fileResult.rows[0].id;
      fileName = file.name;
    }
    // Caso 2: URL (YouTube, TikTok, Instagram)
    else if (sourceUrl) {
      console.log("🔍 [API Upload] sourceUrl recibido:", sourceUrl);
      console.log("🔍 [API Upload] Tipo de sourceUrl:", typeof sourceUrl);

      // Determinar tipo por URL
      if (sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be")) {
        fileType = "youtube";
      } else if (sourceUrl.includes("tiktok.com")) {
        fileType = "tiktok";
      } else if (sourceUrl.includes("instagram.com")) {
        fileType = "instagram";
      } else {
        console.error("❌ [API Upload] URL no soportada:", sourceUrl);
        return NextResponse.json(
          { error: "URL no soportada" },
          { status: 400 },
        );
      }

      // Extraer nombre del video de la URL
      const urlParts = sourceUrl.split("/");
      fileName = urlParts[urlParts.length - 1] || "video";

      // Crear registro en tabla files
      const fileResult = await query<{ id: string }>(
        `INSERT INTO files (category_id, name, type, source_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [categoryId, fileName, fileType, sourceUrl],
      );

      fileId = fileResult.rows[0].id;
    } else {
      return NextResponse.json(
        { error: "Se requiere un archivo o URL" },
        { status: 400 },
      );
    }

    // Crear job en tabla jobs
    const jobResult = await query<{ id: string }>(
      `INSERT INTO jobs (file_id, category_id, status)
       VALUES ($1, $2, 'queued')
       RETURNING id`,
      [fileId, categoryId],
    );

    const jobId = jobResult.rows[0].id;
    console.log(
      `✅ [API Upload] Job creado en DB con ID: ${jobId}, status: queued`,
    );

    // Verificar si hay otros jobs processing en esta categoría
    const processingJobs = await query(
      `SELECT id FROM jobs
       WHERE category_id = $1 AND status = 'processing'
       LIMIT 1`,
      [categoryId],
    );

    // Si no hay jobs processing, marcar este como pending
    if (processingJobs.rows.length === 0) {
      await query(`UPDATE jobs SET status = 'pending' WHERE id = $1`, [jobId]);
      console.log(
        `🔄 [API Upload] Job ${jobId} actualizado a status: pending (no hay otros jobs procesando)`,
      );
    } else {
      console.log(
        `⏸️ [API Upload] Job ${jobId} permanece en queued (hay otro job procesando)`,
      );
    }

    // Encolar en pg-boss
    console.log(`📤 [API Upload] Encolando job ${jobId} en pg-boss...`);
    await enqueueFileProcessing({
      jobId,
      fileId,
      categoryId,
      fileType,
      testErrorType: testErrorType || undefined,
    });
    console.log(
      `✅ [API Upload] Job ${jobId} encolado exitosamente en pg-boss`,
    );

    return NextResponse.json(
      {
        jobId,
        fileId,
        fileName,
        fileType,
      },
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
