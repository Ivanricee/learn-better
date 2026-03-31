// Worker independiente para procesamiento de archivos
// Ejecutar con: node worker.js o npm run worker

import { existsSync, readFileSync } from "node:fs";

// Cargar variables de entorno desde archivo sin depender de dotenv
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^['\"]|['\"]$/g, "");
    process.env[key] = value;
  }
}

if (process.env.NODE_ENV !== "production") {
  loadEnvFile(".env.local");
} else {
  loadEnvFile(".env");
}

// Usar dynamic import para que las vars de entorno estén listas
// antes de que worker/index.js sea evaluado por el motor JS
import("./worker/index.js")
  .then(({ startWorker }) => {
    return startWorker();
  })
  .catch((error) => {
    console.error("❌ Error fatal al iniciar worker:", error);
    process.exit(1);
  });
