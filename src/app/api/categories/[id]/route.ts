import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import type { Category } from "@/lib/types";

// GET /api/categories/[id] - Obtener una categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const category = await queryOne<{
      id: string;
      nombre: string;
      created_at: Date;
    }>(`SELECT id, nombre, created_at FROM categories WHERE id = $1`, [id]);

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    // Calcular temas y progreso
    const temasResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM topics WHERE category_id = $1`,
      [id],
    );
    const temas = parseInt(temasResult.rows[0]?.count || "0");

    const activitiesResult = await query<{
      total: string;
      completed: string;
    }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed
      FROM activities
      WHERE category_id = $1`,
      [id],
    );

    const total = parseInt(activitiesResult.rows[0]?.total || "0");
    const completed = parseInt(activitiesResult.rows[0]?.completed || "0");
    const progreso = total > 0 ? Math.round((completed / total) * 100) : 0;

    const categoryWithStats: Category = {
      id: category.id,
      nombre: category.nombre,
      temas,
      progreso,
    };

    return NextResponse.json(categoryWithStats);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 },
    );
  }
}

// PATCH /api/categories/[id] - Actualizar categoría
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const result = await query<{ id: string; nombre: string }>(
      `UPDATE categories SET nombre = $1 WHERE id = $2 RETURNING id, nombre`,
      [nombre.trim(), id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    // Calcular temas y progreso
    const temasResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM topics WHERE category_id = $1`,
      [id],
    );
    const temas = parseInt(temasResult.rows[0]?.count || "0");

    const activitiesResult = await query<{
      total: string;
      completed: string;
    }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed
      FROM activities
      WHERE category_id = $1`,
      [id],
    );

    const total = parseInt(activitiesResult.rows[0]?.total || "0");
    const completed = parseInt(activitiesResult.rows[0]?.completed || "0");
    const progreso = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      id: result.rows[0].id,
      nombre: result.rows[0].nombre,
      temas,
      progreso,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await query(
      `DELETE FROM categories WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 },
    );
  }
}
