import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileAudio, Download } from "lucide-react";
import { getStorageUrl } from "@/lib/utils";
import { getFileIcon } from "./utils";
import type { StorageAsset } from "./types";

export interface AssetPreviewProps {
  asset: StorageAsset;
  onDownload: (asset: StorageAsset) => void;
}

export default function AssetPreview({ asset, onDownload }: AssetPreviewProps) {
  const url = getStorageUrl(asset.file_path);
  const mime = asset.mime_type || "";

  if (mime.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={asset.alt_text || asset.file_name}
        className="max-h-[300px] w-auto object-contain rounded-md shadow-sm"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        src={url}
        controls
        className="w-full max-h-[300px] rounded-md shadow-sm bg-black"
      />
    );
  }

  if (mime.startsWith("audio/")) {
    return (
      <div className="w-full p-4 bg-secondary rounded-md flex flex-col items-center gap-4">
        <FileAudio className="size-16 text-primary" />
        <audio src={url} controls className="w-full" />
      </div>
    );
  }

  if (mime.includes("pdf")) {
    return (
      <div className="w-full h-[300px] bg-secondary/20 rounded-md border flex flex-col items-center justify-center gap-4">
        <FileText className="size-16 text-muted-foreground" />
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open PDF
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      {getFileIcon(mime, "size-20 mb-4 opacity-50")}
      <p className="text-sm">Preview not available for this file type.</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => onDownload(asset)}
      >
        <Download className="mr-2 size-4" /> Download File
      </Button>
    </div>
  );
}
