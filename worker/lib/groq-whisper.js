import { createReadStream } from "fs";
import { stat, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import Groq from "groq-sdk";
import { cutAudioSegment, getAudioDuration } from "./ffmpeg-utils.js";

const CHUNK_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const OVERLAP_SECONDS = 2;
const MAX_DURATION_SECONDS = 2 * 60 * 60; // 2 horas

/**
 * Divide un archivo OGG en chunks de ~5MB con overlap de 2s.
 * Usa el tamaño del archivo + duración real para calcular los cortes.
 *
 * @param {string} oggPath - Ruta del archivo OGG completo
 * @returns {Promise<Array<{ path: string, startSec: number, endSec: number }>>}
 */
export async function chunkAudioFile(oggPath) {
  const fileStat = await stat(oggPath);
  const totalBytes = fileStat.size;
  const totalSec = await getAudioDuration(oggPath);

  // Si el archivo cabe en un solo chunk, devolverlo tal cual
  if (totalBytes <= CHUNK_SIZE_BYTES) {
    return [{ path: oggPath, startSec: 0, endSec: totalSec }];
  }

  // Calcular duración por chunk basada en proporción de bytes
  const secPerByte = totalSec / totalBytes;
  const chunkDurationSec = CHUNK_SIZE_BYTES * secPerByte;

  const chunks = [];
  let startSec = 0;

  while (startSec < totalSec) {
    const endSec = Math.min(startSec + chunkDurationSec, totalSec);
    const duration = endSec - startSec;
    const chunkPath = `/tmp/${randomUUID()}.webm`;

    await cutAudioSegment(oggPath, chunkPath, startSec, duration);
    chunks.push({ path: chunkPath, startSec, endSec });

    // Avanzar descontando el overlap para el siguiente chunk
    startSec = endSec - OVERLAP_SECONDS;

    // Evitar loop infinito si el overlap supera lo que queda
    if (endSec >= totalSec) break;
  }

  return chunks;
}

/**
 * Transcribe todos los chunks con Groq Whisper.
 * Mapea errores HTTP a códigos internos.
 *
 * @param {Array<{ path: string, startSec: number, endSec: number }>} chunks
 * @returns {Promise<Array<{ startSec: number, endSec: number, text: string, segments: Array }>>}
 */
export async function transcribeAll(chunks) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const results = [];

  for (const chunk of chunks) {
    try {
      const response = await groq.audio.transcriptions.create({
        file: createReadStream(chunk.path),
        model: "whisper-large-v3",
        response_format: "verbose_json",
      });

      results.push({
        startSec: chunk.startSec,
        endSec: chunk.endSec,
        text: response.text,
        segments: response.segments || [],
      });
    } catch (err) {
      const status = err?.status ?? err?.error?.status ?? null;

      if (status === 429) {
        const quotaErr = new Error("Cuota de Whisper excedida (429)");
        quotaErr.code = "whisper_quota";
        throw quotaErr;
      }

      if (status === 413) {
        const sizeErr = new Error("Chunk demasiado grande para Whisper");
        sizeErr.code = "conversion_failed";
        throw sizeErr;
      }

      const connErr = new Error(`Error de conexión con Groq: ${err.message}`);
      connErr.code = "connection_error";
      throw connErr;
    }

    // Eliminar el chunk temporal una vez procesado.
    // Si solo hay un chunk, es el archivo original: el caller lo borra.
    if (chunks.length > 1) {
      await unlink(chunk.path).catch(() => {});
    }
  }

  return results;
}

/**
 * Elimina texto duplicado en la unión entre chunks (overlap de 2s)
 * y ajusta los timestamps sumando el offset de inicio de cada chunk.
 *
 * @param {Array<{ startSec: number, endSec: number, text: string, segments: Array }>} rawResults
 * @returns {{ text: string, segments: Array<{ start: number, end: number, text: string }> }}
 */
export function fixOverlap(rawResults) {
  if (rawResults.length === 0) return { text: "", segments: [] };
  if (rawResults.length === 1) {
    const { text, segments, startSec } = rawResults[0];
    return {
      text,
      segments: (segments || []).map((s) => ({
        start: s.start + startSec,
        end: s.end + startSec,
        text: s.text,
      })),
    };
  }

  const allSegments = [];

  for (let i = 0; i < rawResults.length; i++) {
    const { startSec, segments } = rawResults[i];

    // Ajustar timestamps sumando el offset de inicio del chunk
    const adjusted = (segments || []).map((s) => ({
      start: s.start + startSec,
      end: s.end + startSec,
      text: s.text,
    }));

    if (i === 0) {
      allSegments.push(...adjusted);
      continue;
    }

    // Encontrar el punto donde termina el chunk anterior (sin overlap)
    const prevChunkEnd = rawResults[i - 1].endSec - OVERLAP_SECONDS;

    // Filtrar segmentos del chunk actual que ya están cubiertos por el anterior
    const newSegments = adjusted.filter((s) => s.start >= prevChunkEnd);
    allSegments.push(...newSegments);
  }

  const text = allSegments
    .map((s) => s.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return { text, segments: allSegments };
}

export { MAX_DURATION_SECONDS };
