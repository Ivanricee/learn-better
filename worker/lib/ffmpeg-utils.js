import { spawn, execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

/**
 * Verifica si un archivo tiene stream de audio.
 *
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<boolean>} - true si tiene audio, false si no
 */
export async function hasAudioStream(filePath) {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=codec_type",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    return stdout.trim() === "audio";
  } catch (err) {
    return false;
  }
}

/**
 * Convierte cualquier archivo de audio/video a OGG 24kbps mono.
 * Si el video no tiene audio, genera 1 segundo de silencio.
 *
 * @param {string} inputPath - Ruta del archivo de entrada
 * @returns {Promise<{ pid: number, oggPath: string }>}
 */
export async function convertToOgg(inputPath) {
  const id = randomUUID();
  const oggPath = `/tmp/${id}.ogg`;

  // Verificar si tiene audio
  const hasAudio = await hasAudioStream(inputPath);
  console.log(`🔍 [ffmpeg] Archivo tiene audio: ${hasAudio}`);

  return new Promise((resolve, reject) => {
    let ffmpegArgs;

    if (hasAudio) {
      // Caso normal: extraer audio del archivo
      // Agregamos opciones para manejar archivos problemáticos
      ffmpegArgs = [
        "-err_detect",
        "ignore_err",
        "-i",
        inputPath,
        "-vn",
        "-af",
        "aresample=24000",
        "-c:a",
        "libvorbis",
        "-b:a",
        "24k",
        "-ac",
        "1",
        "-y",
        oggPath,
      ];
    } else {
      // Video sin audio: generar 1 segundo de silencio
      console.log("⚠️  [ffmpeg] Video sin audio, generando silencio de 1s");
      ffmpegArgs = [
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=24000:cl=mono",
        "-t",
        "1",
        "-c:a",
        "libvorbis",
        "-b:a",
        "24k",
        "-y",
        oggPath,
      ];
    }

    const proc = spawn("ffmpeg", ffmpegArgs);
    const pid = proc.pid;
    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        console.log(`⚠️  [ffmpeg] Conversión falló, intentando fallback...`);

        // Fallback: intentar con decodificación más agresiva
        const fallbackArgs = [
          "-fflags",
          "+genpts+igndts",
          "-err_detect",
          "ignore_err",
          "-i",
          inputPath,
          "-vn",
          "-ar",
          "24000",
          "-ac",
          "1",
          "-c:a",
          "libvorbis",
          "-b:a",
          "24k",
          "-y",
          oggPath,
        ];

        const fallbackProc = spawn("ffmpeg", fallbackArgs);
        let fallbackStderr = "";

        fallbackProc.stderr.on("data", (data) => {
          fallbackStderr += data.toString();
        });

        fallbackProc.on("close", (fallbackCode) => {
          if (fallbackCode !== 0) {
            reject(
              new Error(
                `ffmpeg falló con código ${code}: ${stderr.slice(-500)}`,
              ),
            );
            return;
          }
          console.log(`✅ [ffmpeg] Conversión exitosa con fallback`);
          resolve({ pid: fallbackProc.pid, oggPath });
        });

        fallbackProc.on("error", (err) => {
          reject(new Error(`ffmpeg falló: ${err.message}`));
        });

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
