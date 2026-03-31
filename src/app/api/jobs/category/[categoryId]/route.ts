import { NextRequest, NextResponse } from "next/server";
import { queryMany } from "@/lib/db";
import type { Job } from "@/lib/types";
// GET /api/jobs/category/[categoryId] - Listar jobs de una categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;

    const jobs = await queryMany<Job>(
      `SELECT
        j.id,
        j.file_id,
        j.category_id,
        j.status,
        j.step,
        j.progress,
        j.error_type,
        j.error_message,
        j.pid,
        j.retry_count,
        j.created_at,
        j.updated_at,
        f.name as file_name,
        f.type as file_type,
        f.source_url
       FROM jobs j
       JOIN files f ON f.id = j.file_id
       WHERE j.category_id = $1
       ORDER BY j.created_at DESC`,
      [categoryId],
    );

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error al obtener jobs:", error);
    return NextResponse.json(
      { error: "Error al obtener jobs" },
      { status: 500 },
    );
  }
}
