import { NextRequest, NextResponse } from "next/server";
import { query, queryMany } from "@/lib/db";
import type { Category } from "@/lib/types";
/**
 * al agregar una categoria deberia mostrar un sonner de que se esta agregando una nueva categoria. o
 * mostrar un skeleton que simule la categoria hasta que apresca la nueva es decir se cierra el modal
 * y aparece el skeleton y despues la categoria , igual al editar la categoria deberia de dejar
 * el nombre modificado si la consulta a la base de datos falla regresa a como estaba antes
 * si no falla se queda ya con el nombre cambiado (optimistic updates).
 */
// GET /api/categories - Listar todas las categorías
export async function GET() {
  try {
    const categories = await queryMany<{
      id: string;
      nombre: string;
      created_at: Date;
    }>(
      `SELECT id, nombre, created_at FROM categories ORDER BY created_at DESC`,
    );

    // Calcular temas y progreso para cada categoría
    const categoriesWithStats: Category[] = await Promise.all(
      categories.map(async (cat) => {
        // Contar topics (temas)
        const temasResult = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM topics WHERE category_id = $1`,
          [cat.id],
        );
        const temas = parseInt(temasResult.rows[0]?.count || "0");

        // Calcular progreso (% actividades completadas)
        const activitiesResult = await query<{
          total: string;
          completed: string;
        }>(
          `SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE completed = true) as completed
          FROM activities
          WHERE category_id = $1`,
          [cat.id],
        );

        const total = parseInt(activitiesResult.rows[0]?.total || "0");
        const completed = parseInt(activitiesResult.rows[0]?.completed || "0");
        const progreso = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: cat.id,
          nombre: cat.nombre,
          temas,
          progreso,
        };
      }),
    );

    return NextResponse.json(categoriesWithStats);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const result = await query<{
      id: string;
      nombre: string;
      created_at: Date;
    }>(
      `INSERT INTO categories (nombre) VALUES ($1) RETURNING id, nombre, created_at`,
      [nombre.trim()],
    );

    const newCategory = result.rows[0];

    return NextResponse.json(
      {
        id: newCategory.id,
        nombre: newCategory.nombre,
        temas: 0,
        progreso: 0,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 },
    );
  }
}
