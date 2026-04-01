import { spawn } from "child_process";
import { randomUUID } from "crypto";

/**
 * Descarga solo el audio de una URL (YouTube/TikTok/Instagram)
 * usando yt-dlp y lo convierte a WebM/Opus 64kbps.
 *
 * @param {string} url - URL del video
 * @returns {Promise<{ pid: number, oggPath: string }>}
 */
export function downloadAudio(url) {
  const id = randomUUID();
  const outTemplate = `/tmp/${id}`;
  const oggPath = `${outTemplate}.webm`;

  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      url,
      "-f",
      "bestaudio",
      "-x",
      "--audio-format",
      "opus",
      "--audio-quality",
      "64K",
      "--postprocessor-args",
      "ffmpeg:-ac 1 -ar 16000", // mono + 16kHz (igual que Whisper internamente)
      "--no-playlist",
      "-o",
      outTemplate,
    ]);

    const pid = proc.pid;
    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`yt-dlp falló con código ${code}: ${stderr.slice(-500)}`),
        );
        return;
      }
      resolve({ pid, oggPath });
    });

    proc.on("error", (err) => {
      reject(new Error(`No se pudo iniciar yt-dlp: ${err.message}`));
    });
  });
}
