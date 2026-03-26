"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Link as LinkIcon } from "lucide-react";

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  onUrlSubmit: (url: string) => void;
}

const acceptedFormats = [
  "PDF",
  "Word",
  "PPT",
  "MP3",
  "MP4",
  "YouTube",
  "TikTok",
  "Texto",
  "Web",
];

export function DropZone({ onFileAccepted, onUrlSubmit }: DropZoneProps) {
  const [url, setUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "audio/*": [".mp3", ".wav", ".m4a"],
      "video/*": [".mp4", ".mov", ".webm"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  const handleUrlSubmit = () => {
    if (url.trim()) {
      onUrlSubmit(url.trim());
      setUrl("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative h-40 rounded-xl border border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-2
          transition-all duration-150
          ${
            isDragActive
              ? "border-[var(--primary)] bg-[var(--primary-muted)]"
              : "border-[var(--border)] bg-[var(--background-elevated)] hover:border-[var(--border-hover)]"
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-8 h-8 transition-colors duration-150 ${
            isDragActive
              ? "text-[var(--primary)]"
              : "text-[var(--foreground-tertiary)]"
          }`}
        />
        <p
          className={`text-sm transition-colors duration-150 ${
            isDragActive
              ? "text-[var(--primary)]"
              : "text-[var(--foreground-secondary)]"
          }`}
        >
          {isDragActive ? "Suelta aquí" : "Arrastra tus archivos aquí"}
        </p>
        <p className="text-xs text-[var(--foreground-tertiary)]">
          PDF · Word · PPT · Audio · Video · Texto
        </p>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)] focus-within:border-[var(--primary)] transition-colors duration-150">
          <LinkIcon className="w-4 h-4 text-[var(--foreground-tertiary)]" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pega una URL de YouTube, TikTok o cualquier web"
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] outline-none"
          />
        </div>
        <button
          onClick={handleUrlSubmit}
          disabled={!url.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Agregar
        </button>
      </div>

      {/* Format chips */}
      <div className="flex flex-wrap gap-2">
        {acceptedFormats.map((format) => (
          <span
            key={format}
            className="px-2 py-1 rounded-full text-xs text-[var(--foreground-tertiary)] bg-[var(--background-elevated)] border border-[var(--border-subtle)]"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  );
}
