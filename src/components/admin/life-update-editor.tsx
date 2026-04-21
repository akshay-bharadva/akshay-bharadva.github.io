import React, { useState, useEffect } from "react";
import type { LifeUpdate } from "@/types";
import {
  useAddLifeUpdateMutation,
  useUpdateLifeUpdateMutation,
} from "@/store/api/adminApi";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Upload, ImageIcon } from "lucide-react";
import {
  SheetClose,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LIFE_UPDATE_CATEGORY_OPTIONS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import imageCompression from "browser-image-compression";

const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME || "assets";

interface LifeUpdateEditorProps {
  update: LifeUpdate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LifeUpdateEditor({
  update,
  onCancel,
  onSuccess,
}: LifeUpdateEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("thought");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [addLifeUpdate, { isLoading: isAdding }] = useAddLifeUpdateMutation();
  const [updateLifeUpdate, { isLoading: isUpdating }] =
    useUpdateLifeUpdateMutation();
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (update) {
      setTitle(update.title || "");
      setContent(update.content || "");
      setCategory(update.category || "thought");
      setImageUrl(update.image_url || "");
      setTags(update.tags?.join(", ") || "");
      setIsPublished(update.is_published ?? false);
    } else {
      setTitle("");
      setContent("");
      setCategory("thought");
      setImageUrl("");
      setTags("");
      setIsPublished(false);
    }
  }, [update]);

  const handleImageUpload = async (file: File) => {
    if (!supabase) {
      toast.error("DB connection missing. Cannot upload images.");
      return;
    }

    setIsUploading(true);

    let compressedFile = file;
    try {
      if (file.type.startsWith("image/")) {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.8,
        });
      }
    } catch {
      toast.warning("Compression failed, uploading original.");
    }

    const sanitizedName = compressedFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/__+/g, "_");
    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = `life_updates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedFile);

    setIsUploading(false);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    setImageUrl(urlData.publicUrl);
    toast.success("Image uploaded");
  };

  const onImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleImageUpload(file);
    if (event.target) event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const data: Partial<LifeUpdate> = {
      title: title || null,
      content: content || null,
      category: category as LifeUpdate["category"],
      image_url: imageUrl || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      is_published: isPublished,
    };

    try {
      if (update?.id) {
        await updateLifeUpdate({ ...data, id: update.id }).unwrap();
      } else {
        await addLifeUpdate(data).unwrap();
      }
      toast.success("Life update saved.");
      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to save", { description: getErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex shrink-0 justify-between items-center py-4 border-b">
        <div className="space-y-1">
          <SheetTitle>
            {update?.id ? "Edit Update" : "New Life Update"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Share what you&apos;re up to.
          </SheetDescription>
        </div>
        <SheetClose asChild>
          <Button type="button" variant="ghost">
            <X />
          </Button>
        </SheetClose>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col min-h-0 pt-4 gap-4 overflow-y-auto"
      >
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="font-bold text-lg h-12 border-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:bg-secondary/20 placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIFE_UPDATE_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
                id="published"
              />
              <Label htmlFor="published" className="text-sm cursor-pointer">
                Published
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Content
          </Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Image
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={onImageSelected}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                asChild
              >
                <span>
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                </span>
              </Button>
            </label>
            {imageUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setImageUrl("")}
                title="Clear"
                type="button"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          {imageUrl && (
            <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border bg-secondary/30">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          {!imageUrl && (
            <label className="mt-2 flex items-center justify-center h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-secondary/20 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={onImageSelected}
                className="hidden"
              />
              <div className="flex flex-col items-center text-muted-foreground text-xs">
                <ImageIcon className="size-5 mb-1" />
                <span>Drop or click to upload</span>
              </div>
            </label>
          )}
        </div>

        {/* Tags */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Tags (comma-separated)
          </Label>
          <div className="flex items-center gap-2 border rounded-md px-3 bg-background focus-within:ring-1 focus-within:ring-ring">
            <span className="text-muted-foreground">#</span>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="TV Shows, Friends, Fun..."
              className="border-none shadow-none focus-visible:ring-0 h-9 p-0"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 justify-end gap-3 pt-4 mt-auto border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
