import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import type { Job } from "@/lib/types";
// GET /api/jobs/[id] - Consultar estado de un job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const job = await queryOne<Job>(
      `SELECT id, file_id, category_id, status, step, progress,
              error_type, error_message, pid, retry_count, created_at, updated_at
       FROM jobs
       WHERE id = $1`,
      [id],
    );

    if (!job) {
      return NextResponse.json({ error: "Job no encontrado" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error al obtener job:", error);
    return NextResponse.json(
      { error: "Error al obtener job" },
      { status: 500 },
    );
  }
}

// DELETE /api/jobs/[id] - Cancelar job: mata proceso, elimina archivo físico, elimina job+file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const job = await queryOne<{
      status: string;
      category_id: string;
      file_id: string;
      pid: number | null;
    }>(`SELECT status, category_id, file_id, pid FROM jobs WHERE id = $1`, [
      id,
    ]);

    if (!job) {
      return NextResponse.json({ error: "Job no encontrado" }, { status: 404 });
    }

    // Matar proceso del worker si está corriendo
    if (job.pid) {
      try {
        process.kill(job.pid, "SIGTERM");
        console.log(`✅ SIGTERM enviado al proceso ${job.pid}`);
      } catch {
        // El proceso ya terminó, continuar
      }
    }

    // Eliminar archivo físico si existe
    const file = await queryOne<{ storage_path: string | null }>(
      `SELECT storage_path FROM files WHERE id = $1`,
      [job.file_id],
    );
    if (file?.storage_path) {
      try {
        const { unlink } = await import("fs/promises");
        await unlink(file.storage_path);
        console.log(`✅ Archivo físico eliminado: ${file.storage_path}`);
      } catch (error) {
        console.error("Error al eliminar archivo físico:", error);
      }
    }

    // Eliminar registro de files (CASCADE eliminará el job automáticamente)
    await query(`DELETE FROM files WHERE id = $1`, [job.file_id]);

    // Promover el siguiente job queued de esta categoría a pending
    const nextJob = await queryOne<{ id: string }>(
      `SELECT id FROM jobs
       WHERE category_id = $1 AND status = 'queued'
       ORDER BY created_at ASC
       LIMIT 1`,
      [job.category_id],
    );
    if (nextJob) {
      await query(`UPDATE jobs SET status = 'pending' WHERE id = $1`, [
        nextJob.id,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al cancelar job:", error);
    return NextResponse.json(
      { error: "Error al cancelar job" },
      { status: 500 },
    );
  }
}
