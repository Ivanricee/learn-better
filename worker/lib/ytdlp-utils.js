import { spawn } from "child_process";
import { randomUUID } from "crypto";

/**
 * Intenta descargar con un navegador específico
 */
function tryDownloadWithBrowser(url, outTemplate, browser) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      "-f",
      "bestaudio",
      "-x",
      "--audio-format",
      "vorbis",
      "--audio-quality",
      "64K",
      "--postprocessor-args",
      "ffmpeg:-ac 1 -ar 16000 -c:a libopus -b:a 64k",
      "--no-playlist",
      "-o",
      outTemplate,
    ];

    if (browser) {
      args.splice(-2, 0, "--cookies-from-browser", browser);
    }

    const proc = spawn("yt-dlp", args);
    const pid = proc.pid;
    let stderr = "";

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject({
          code,
          stderr: stderr.slice(-500),
          browser,
        });
        return;
      }
      resolve({ pid, oggPath: `${outTemplate}.ogg` });
    });

    proc.on("error", (err) => {
      reject({
        code: -1,
        stderr: err.message,
        browser,
      });
    });
  });
}

/**
 * Descarga solo el audio de una URL (YouTube/TikTok/Instagram)
 * usando yt-dlp y lo convierte a OGG Opus 64kbps 16kHz mono.
 * Intenta múltiples navegadores automáticamente para obtener cookies.
 *
 * @param {string} url - URL del video
 * @returns {Promise<{ pid: number, oggPath: string }>}
 */
export async function downloadAudio(url) {
  const id = randomUUID();
  const outTemplate = `/tmp/${id}`;
  const browsers = [
    "chrome",
    "firefox",
    "edge",
    "brave",
    "safari",
    "opera",
    "vivaldi",
  ];

  let lastError = null;

  // Intentar con cada navegador
  for (const browser of browsers) {
    try {
      const result = await tryDownloadWithBrowser(url, outTemplate, browser);
      return result;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  // Si todos los navegadores fallan, intentar sin cookies como último recurso
  try {
    const result = await tryDownloadWithBrowser(url, outTemplate, null);
    return result;
  } catch (err) {
    // Si incluso sin cookies falla, lanzar error detallado
    throw new Error(
      `yt-dlp falló. Error sin cookies: ${err.stderr}. Último navegador intentado (${lastError.browser}): ${lastError.stderr}`,
    );
  }
}
