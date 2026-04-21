import React from "react";
import { getStorageUrl } from "@/lib/utils";
import { getFileIcon } from "./utils";
import type { StorageAsset } from "./types";

export interface AssetThumbnailProps {
  asset: StorageAsset;
}

export default function AssetThumbnail({ asset }: AssetThumbnailProps) {
  const isImage = asset.mime_type?.startsWith("image/");

  if (isImage) {
    return (
      <img
        src={getStorageUrl(asset.file_path)}
        alt={asset.alt_text || asset.file_name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    );
  }

  const Icon = getFileIcon(asset.mime_type, "size-8 text-muted-foreground");

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/30 p-2 text-center group-hover:bg-secondary/50 transition-colors">
      {Icon}
    </div>
  );
}
