import React from "react";
import {
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  File as FileIcon,
  FileCode,
} from "lucide-react";

export const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "assets";
export const PLACEHOLDER_FILENAME = ".emptyFolderPlaceholder";

export const getFileIcon = (mimeType: string | null, className?: string) => {
  if (!mimeType) return React.createElement(FileIcon, { className });
  if (mimeType.startsWith("image/")) return null;
  if (mimeType.startsWith("video/"))
    return React.createElement(FileVideo, { className });
  if (mimeType.startsWith("audio/"))
    return React.createElement(FileAudio, { className });
  if (mimeType.includes("pdf"))
    return React.createElement(FileText, { className });
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  )
    return React.createElement(FileArchive, { className });
  if (
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("html")
  )
    return React.createElement(FileCode, { className });
  return React.createElement(FileIcon, { className });
};

export const getAllFolderPaths = (
  assets: Array<{ file_path: string }>
): string[] => {
  const folders = new Set<string>();
  assets.forEach((asset) => {
    const parts = asset.file_path.split("/");
    if (parts.length > 1) {
      const folderPath = parts.slice(0, -1).join("/");
      folders.add(folderPath);
    }
  });
  return Array.from(folders).sort();
};

export const getAssetsForPath = <
  T extends { file_path: string; file_name: string },
>(
  assets: T[],
  currentPath: string[]
): { currentFolderAssets: T[]; subFolders: string[] } => {
  const pathPrefix = currentPath.length > 0 ? currentPath.join("/") + "/" : "";

  const folders = new Set<string>();
  const files: T[] = [];

  assets.forEach((asset) => {
    if (!asset.file_path.startsWith(pathPrefix)) return;

    const relativePath = asset.file_path.slice(pathPrefix.length);
    const parts = relativePath.split("/");

    if (parts.length > 1) {
      folders.add(parts[0]);
    } else {
      if (asset.file_name !== PLACEHOLDER_FILENAME) {
        files.push(asset);
      }
    }
  });

  return {
    subFolders: Array.from(folders).sort(),
    currentFolderAssets: files,
  };
};
