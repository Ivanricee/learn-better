import { NextRequest, NextResponse } from "next/server";
import { query, queryMany } from "@/lib/db";
import type { Topic } from "@/lib/types";

// GET /api/categories/[id]/topics - Listar topics de una categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const topics = await queryMany<Topic>(
      `SELECT id, category_id, nombre, zona, estado, orden, created_at
       FROM topics
       WHERE category_id = $1
       ORDER BY zona, orden, created_at`,
      [id],
    );

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error al obtener topics:", error);
    return NextResponse.json(
      { error: "Error al obtener topics" },
      { status: 500 },
    );
  }
}

// POST /api/categories/[id]/topics - Crear topic (usado en generación de temario)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, zona = "zona2", estado = "pendiente", orden } = body;

    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const result = await query<Topic>(
      `INSERT INTO topics (category_id, nombre, zona, estado, orden)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, category_id, nombre, zona, estado, orden, created_at`,
      [id, nombre.trim(), zona, estado, orden],
    );

    const newTopic = result.rows[0];

    // Crear las 3 actividades por defecto para este topic
    await query(
      `INSERT INTO activities (topic_id, category_id, type, label) VALUES
       ($1, $2, 'quiz_multiple', 'Quiz: opción múltiple'),
       ($1, $2, 'flashcard', 'Flashcards'),
       ($1, $2, 'roleplay', 'Roleplay')`,
      [newTopic.id, id],
    );

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error("Error al crear topic:", error);
    return NextResponse.json(
      { error: "Error al crear topic" },
      { status: 500 },
    );
  }
}
