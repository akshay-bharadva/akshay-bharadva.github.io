import React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, ExternalLink, X } from "lucide-react";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";
import AssetPreview from "./asset-preview";
import type { StorageAsset } from "./types";

export interface AssetDetailsSheetProps {
  asset: StorageAsset | null;
  onClose: () => void;
  onUpdateAltText: (e: React.FormEvent<HTMLFormElement>) => void;
  onDownload: (asset: StorageAsset) => void;
}

export default function AssetDetailsSheet({
  asset,
  onClose,
  onUpdateAltText,
  onDownload,
}: AssetDetailsSheetProps) {
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  return (
    <Sheet open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="flex justify-between items-center p-4 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
          <SheetHeader className="text-left">
            <SheetTitle>Asset Details</SheetTitle>
            <SheetDescription className="hidden sm:block">
              View details, edit alt text, and see usage.
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-center gap-1">
            {asset && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(asset)}
                title="Download"
              >
                <Download className="size-4" />
              </Button>
            )}
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </div>

        {asset && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="rounded-lg border bg-secondary/20 p-2 flex items-center justify-center min-h-[200px]">
              <AssetPreview asset={asset} onDownload={onDownload} />
            </div>

            <form onSubmit={onUpdateAltText} className="space-y-3">
              <Label htmlFor="alt_text">Alt Text (Accessibility)</Label>
              <div className="flex gap-2">
                <Input
                  id="alt_text"
                  name="alt_text"
                  defaultValue={asset.alt_text || ""}
                  placeholder="Describe this asset..."
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <Label>File Information</Label>
              <div className="rounded-md border p-3 text-sm space-y-2 bg-card">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filename:</span>
                  <span className="font-mono text-xs truncate max-w-[200px]">
                    {asset.file_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Folder:</span>
                  <span className="font-mono text-xs truncate max-w-[200px]">
                    {asset.file_path.split("/").slice(0, -1).join("/") ||
                      "Root"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>
                    {asset.size_kb ? `${asset.size_kb.toFixed(1)} KB` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="uppercase">
                    {asset.mime_type?.split("/")[1] || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input
                  value={getStorageUrl(asset.file_path)}
                  readOnly
                  className="text-xs font-mono bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyUrl(getStorageUrl(asset.file_path))}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Used In</Label>
              {asset.used_in && asset.used_in.length > 0 ? (
                <div className="space-y-2">
                  {asset.used_in.map((use, i) => (
                    <Link
                      key={i}
                      href="#"
                      className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent transition-colors text-sm group"
                    >
                      <span className="font-medium">{use.type}</span>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-md border border-dashed text-center text-sm text-muted-foreground bg-muted/10">
                  Not currently used in any known content.
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
