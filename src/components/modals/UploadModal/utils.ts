import type { ResourceType } from "@/lib/types";

export const SUPPORTED_TYPES_LABEL =
  "PDF · Audio · Video · Imagen · Texto/Markdown";

const normalizePendingValue = (value: string) => value.trim().toLowerCase();

export const getFilePendingKey = (name: string, type: ResourceType) =>
  `file:${type}:${normalizePendingValue(name)}`;

export const getUrlPendingKey = (url: string) =>
  `url:${normalizePendingValue(url)}`;

export function getResourceType(file: File): ResourceType {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (file.type.includes("pdf") || ext === "pdf") return "pdf";
  if (ext === "md") return "markdown";

  if (
    file.type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "avif"].includes(ext || "")
  ) {
    return "image";
  }

  if (
    file.type.includes("audio") ||
    ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext || "")
  ) {
    return "audio";
  }

  if (
    file.type.includes("video") ||
    ["mp4", "webm", "mov"].includes(ext || "")
  ) {
    return "video";
  }

  return "text";
}

export function getUrlResourceType(url: string): ResourceType {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return "url";
}

export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extraer video ID de YouTube
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        videoId = urlObj.searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = urlObj.pathname.split("/")[1] || "";
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0] || "";
      }
      return videoId ? `youtube.com/.../${videoId}` : url;
    }

    if (url.includes("tiktok.com")) {
      const pathParts = urlObj.pathname.split("/");
      const username =
        pathParts.find((part) => part.startsWith("@")) || "@creator";
      return `TikTok ${username}`;
    }

    if (url.includes("instagram.com")) {
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const username = pathParts[0] ? `@${pathParts[0]}` : "";
      return `Instagram ${username}`.trim();
    }

    return urlObj.hostname.replace("www.", "");
  } catch {
    return "Enlace externo";
  }
}
