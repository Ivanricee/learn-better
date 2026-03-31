import { spawn, execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

/**
 * Convierte cualquier archivo de audio/video a OGG 24kbps mono.
 *
 * @param {string} inputPath - Ruta del archivo de entrada
 * @returns {Promise<{ pid: number, oggPath: string }>}
 */
export function convertToOgg(inputPath) {
  const id = randomUUID();
  const oggPath = `/tmp/${id}.ogg`;

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-vn",
      "-c:a",
      "libvorbis",
      "-b:a",
      "24k",
      "-ac",
      "1",
      "-y",
      oggPath,
    ]);

    const pid = proc.pid;
    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`ffmpeg falló con código ${code}: ${stderr.slice(-500)}`),
        );
        return;
      }
      resolve({ pid, oggPath });
    });

    proc.on("error", (err) => {
      reject(new Error(`No se pudo iniciar ffmpeg: ${err.message}`));
    });
  });
}

/**
 * Obtiene la duración de un archivo de audio/video en segundos usando ffprobe.
 *
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<number>} - Duración en segundos (float)
 */
export async function getAudioDuration(filePath) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  const duration = parseFloat(stdout.trim());
  if (isNaN(duration)) {
    throw new Error(`No se pudo obtener duración del archivo: ${filePath}`);
  }
  return duration;
}

/**
 * Corta un fragmento de audio sin recodificar.
 *
 * @param {string} inputPath - Ruta del archivo de entrada
 * @param {string} outputPath - Ruta del archivo de salida
 * @param {number} startSec - Segundo de inicio
 * @param {number} durationSec - Duración del fragmento en segundos
 * @returns {Promise<void>}
 */
export async function cutAudioSegment(
  inputPath,
  outputPath,
  startSec,
  durationSec,
) {
  await execFileAsync("ffmpeg", [
    "-ss",
    String(startSec),
    "-t",
    String(durationSec),
    "-i",
    inputPath,
    "-c",
    "copy",
    "-y",
    outputPath,
  ]);
}
