import { z } from "zod";

export const FILE_SIZE_LIMITS = {
  audio: 100 * 1024 * 1024,
  video: 400 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
  text: 5 * 1024 * 1024,
  markdown: 5 * 1024 * 1024,
} as const;

export const FILE_SIZE_LABELS = {
  audio: "100 MB",
  video: "400 MB",
  image: "20 MB",
  pdf: "50 MB",
  text: "5 MB",
  markdown: "5 MB",
} as const;

export const ACCEPTED_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "webp", "avif"],
  video: ["mp4", "webm", "mov"],
  audio: ["mp3", "wav", "m4a", "ogg", "flac"],
  pdf: ["pdf"],
  text: ["txt", "doc", "docx"],
  markdown: ["md"],
} as const;

export const ACCEPTED_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/quicktime": [".mov"],
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/mp4": [".m4a"],
  "audio/ogg": [".ogg"],
  "audio/webm": [".webm"],
  "audio/flac": [".flac"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/markdown": [".md"],
  "text/x-markdown": [".md"],
};

type FileCategory = keyof typeof FILE_SIZE_LIMITS;

function getFileCategoryByExt(ext: string): FileCategory | null {
  for (const [category, exts] of Object.entries(ACCEPTED_EXTENSIONS)) {
    if ((exts as readonly string[]).includes(ext)) {
      return category as FileCategory;
    }
  }
  return null;
}

export function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const category = getFileCategoryByExt(ext);

  if (!category) {
    return "Formato no compatible";
  }

  const limit = FILE_SIZE_LIMITS[category];
  if (file.size > limit) {
    return `El archivo supera el límite de ${FILE_SIZE_LABELS[category]} para ${category}`;
  }

  return null;
}

const SUPPORTED_URL_PATTERNS = [
  /youtube\.com/,
  /youtu\.be/,
  /instagram\.com/,
  /tiktok\.com/,
];

function isSupportedUrl(url: string): boolean {
  return SUPPORTED_URL_PATTERNS.some((pattern) => pattern.test(url));
}

export const uploadUrlSchema = z.object({
  url: z
    .string()
    .min(1, "Ingresa una URL")
    .url("La URL no es válida. Ej: https://youtube.com/watch?v=...")
    .refine(isSupportedUrl, {
      message: "Solo se aceptan enlaces de YouTube, Instagram o TikTok",
    }),
});

export type UploadUrlFormValues = z.infer<typeof uploadUrlSchema>;
