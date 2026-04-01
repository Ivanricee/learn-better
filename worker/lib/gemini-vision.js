import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";

/**
 * Extrae descripción detallada de una imagen usando Gemini Vision.
 *
 * @param {string} imagePath - Ruta local de la imagen
 * @returns {Promise<string>} - Descripción generada por Gemini
 */
export async function extractImageDescription(imagePath) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const mimeType = imagePath.endsWith(".png")
    ? "image/png"
    : imagePath.endsWith(".jpg") || imagePath.endsWith(".jpeg")
      ? "image/jpeg"
      : imagePath.endsWith(".webp")
        ? "image/webp"
        : imagePath.endsWith(".gif")
          ? "image/gif"
          : "image/jpeg";

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
    "Describe esta imagen en detalle, incluyendo todos los elementos visuales, texto visible, y contexto relevante.",
  ]);

  return result.response.text();
}
