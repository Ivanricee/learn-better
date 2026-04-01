import Groq from "groq-sdk";
import { readFile } from "fs/promises";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractImageDescription(imagePath) {
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

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: "Describe esta imagen en detalle, incluyendo todos los elementos visuales, texto visible, y contexto relevante.",
          },
        ],
      },
    ],
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}
