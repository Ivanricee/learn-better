import { FileText, Image, Link2, Music, Video, X } from "lucide-react";
import type { ResourceType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import type { PendingResource } from "./types";

interface PendingResourcesListProps {
  pendingFiles: PendingResource[];
  removePendingFile: (index: number) => void;
}

function getFileIcon(type: ResourceType) {
  switch (type) {
    case "youtube":
    case "video":
    case "tiktok":
      return <Video className="w-4 h-4" />;
    case "audio":
      return <Music className="w-4 h-4" />;
    case "image":
      return <Image className="w-4 h-4" />;
    case "pdf":
    case "text":
    case "markdown":
      return <FileText className="w-4 h-4" />;
    default:
      return <Link2 className="w-4 h-4" />;
  }
}

export function PendingResourcesList({
  pendingFiles,
  removePendingFile,
}: PendingResourcesListProps) {
  if (pendingFiles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--foreground-secondary)]">
        Archivos a subir ({pendingFiles.length})
      </p>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {pendingFiles.map((file, index) => (
          <div
            key={file.key}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border-subtle)]"
          >
            <div className="p-1.5 rounded-md bg-[var(--primary-muted)] text-[var(--primary)]">
              {getFileIcon(file.type)}
            </div>
            <span className="flex-1 text-sm text-[var(--foreground)] truncate">
              {file.name}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removePendingFile(index)}
              className="rounded text-[var(--foreground-tertiary)] hover:text-[var(--alert)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
