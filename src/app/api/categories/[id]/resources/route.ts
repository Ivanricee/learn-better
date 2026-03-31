import { NextRequest, NextResponse } from "next/server";
import { queryMany } from "@/lib/db";

interface ResourceRow {
  id: string;
  name: string;
  type: string;
  source_url: string | null;
  storage_path: string | null;
  created_at: Date;
  job_id: string | null;
  job_status: string | null;
  job_step: string | null;
  job_progress: number | null;
  job_error_type: string | null;
  job_error_message: string | null;
}

// GET /api/categories/[id]/resources - JOIN files + jobs para la categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const rows = await queryMany<ResourceRow>(
      `SELECT
        f.id,
        f.name,
        f.type,
        f.source_url,
        f.storage_path,
        f.created_at,
        j.id          AS job_id,
        j.status      AS job_status,
        j.step        AS job_step,
        j.progress    AS job_progress,
        j.error_type  AS job_error_type,
        j.error_message AS job_error_message
      FROM files f
      LEFT JOIN jobs j ON j.file_id = f.id
      WHERE f.category_id = $1
      ORDER BY f.created_at DESC`,
      [id],
    );

    const resources = rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      source_url: row.source_url,
      storage_path: row.storage_path,
      created_at: row.created_at,
      job: row.job_id
        ? {
            id: row.job_id,
            status: row.job_status,
            step: row.job_step,
            progress: row.job_progress ?? 0,
            error_type: row.job_error_type,
            error_message: row.job_error_message,
          }
        : null,
    }));

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error al obtener resources:", error);
    return NextResponse.json(
      { error: "Error al obtener resources" },
      { status: 500 },
    );
  }
}
