import type React from "react";
import { useState, useEffect, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import type { BlogPost } from "@/types";
import NovelEditor from "@/components/admin/novel-editor";
import { supabase } from "@/supabase/client";
import imageCompression from "browser-image-compression";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Save,
  Settings,
  Image as ImageIcon,
  Upload,
  Globe,
  FileText,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}

const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME || "assets";

export default function BlogEditor({
  post,
  onSave,
  onCancel,
}: BlogEditorProps) {
  const isMobile = useIsMobile();
  const initialFormData = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
    show_toc: true,
    cover_image_url: "",
    internal_notes: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        tags: post.tags?.join(", ") || "",
        published: post.published ?? false,
        show_toc: post.show_toc ?? true,
        cover_image_url: post.cover_image_url || "",
        internal_notes: post.internal_notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !prev.slug || !post?.id ? generateSlug(title) : prev.slug,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must be lowercase, alphanumeric, with single hyphens.";
    }
    if (!formData.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    setIsSaving(true);

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const postDataToSave: Partial<BlogPost> = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published: formData.published,
      show_toc: formData.show_toc,
      cover_image_url: formData.cover_image_url || null,
      internal_notes: formData.internal_notes || null,
    };

    await onSave(postDataToSave);

    if (supabase) {
      await supabase.rpc("update_asset_usage");
    }

    setIsSaving(false);
  };

  const handleImageUpload = async (
    file: File,
    forCoverImage: boolean = false,
  ): Promise<string> => {
    if (!file) return "";
    if (!supabase) {
      toast.error("DB connection missing. Cannot upload images.");
      return "";
    }

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, image_upload: "" }));

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.8,
    };

    let compressedFile = file;
    try {
      if (file.type.startsWith("image/")) {
        compressedFile = await imageCompression(file, options);
      }
    } catch (error) {
      console.error("Image compression error:", error);
      toast.warning("Compression failed, uploading original.");
    }

    const sanitizedName = compressedFile.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/__+/g, "_");
    const fileName = `${Date.now()}_${sanitizedName}`;
    const filePath = `blog_images/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, compressedFile);

    setIsUploading(false);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return "";
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    const imageUrl = urlData.publicUrl;

    if (forCoverImage) {
      setFormData((prev) => ({ ...prev, cover_image_url: imageUrl }));
      toast.success("Cover image uploaded");
    } else {
      toast.success("Image uploaded");
    }

    return imageUrl;
  };

  const onCoverImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file, true);
    }
    if (event.target) event.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] overflow-hidden"
    >
      {/* Sticky Header Toolbar */}
      <div className="shrink-0 sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-background/95 py-4 gap-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="-ml-2"
          >
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge
              variant={formData.published ? "default" : "secondary"}
              className={
                formData.published
                  ? "bg-green-500/15 text-green-600 hover:bg-green-500/25"
                  : ""
              }
            >
              {formData.published ? "Published" : "Draft"}
            </Badge>
            {isSaving && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Saving...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Settings className="mr-2 size-4" /> Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
              <div className="flex justify-between items-center">
                <SheetHeader>
                  <SheetTitle>Post Settings</SheetTitle>
                  <SheetDescription>
                    Manage metadata, SEO, and publication details.
                  </SheetDescription>
                </SheetHeader>
                <SheetClose asChild>
                  <Button type="button" variant="ghost">
                    <X />
                  </Button>
                </SheetClose>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
                <div className="space-y-6">
                  {/* Publication Toggle */}
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-secondary/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">Publish Post</Label>
                      <p className="text-xs text-muted-foreground">
                        Make this post visible to the public.
                      </p>
                    </div>
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, published: checked }))
                      }
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-secondary/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        Show Table of Contents
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Display a sticky sidebar with content headings.
                      </p>
                    </div>
                    <Switch
                      checked={formData.show_toc}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, show_toc: checked }))
                      }
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="flex items-center gap-2">
                      <Globe className="size-3.5" /> Slug URL
                    </Label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs text-muted-foreground">
                        /blog/
                      </span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        className={cn(
                          "rounded-l-none font-mono text-sm",
                          errors.slug &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-xs text-destructive">{errors.slug}</p>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          excerpt: e.target.value,
                        }))
                      }
                      placeholder="Brief summary for SEO and previews..."
                      className="resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="react, typescript, tutorial"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma separated values.
                    </p>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <Tabs defaultValue="url" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-2">
                        <TabsTrigger value="url">Image URL</TabsTrigger>
                        <TabsTrigger value="upload">Upload New</TabsTrigger>
                      </TabsList>

                      <TabsContent value="url">
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={formData.cover_image_url}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                cover_image_url: e.target.value,
                              }))
                            }
                          />
                          {formData.cover_image_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  cover_image_url: "",
                                }))
                              }
                              title="Clear"
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste a URL from Unsplash or your Asset Manager.
                        </p>
                      </TabsContent>

                      <TabsContent value="upload">
                        <div
                          className="rounded-lg border border-dashed p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => coverImageInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center py-2">
                            <Upload className="size-6 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">
                              Click to upload
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG or GIF
                            </p>
                          </div>
                          <input
                            type="file"
                            ref={coverImageInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={onCoverImageSelected}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Image Preview */}
                    {formData.cover_image_url && (
                      <div className="mt-3 relative aspect-video w-full overflow-hidden rounded-md border bg-secondary/30">
                        <img
                          src={formData.cover_image_url}
                          alt="Cover Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                          Preview
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Internal Notes */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="internal_notes"
                      className="flex items-center gap-2"
                    >
                      <FileText className="size-3.5" /> Internal Notes
                    </Label>
                    <Textarea
                      id="internal_notes"
                      rows={4}
                      value={formData.internal_notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          internal_notes: e.target.value,
                        }))
                      }
                      placeholder="Ideas, todos, or references..."
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Button
            onClick={() => handleSubmit()}
            disabled={isSaving || isUploading}
            className="flex-1 sm:flex-none shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" /> Save Post
              </>
            )}
          </Button>
        </div>
      </div>

    <div className="flex-1 flex flex-col min-h-0 max-w-5xl mx-auto w-full mt-2 sm:mt-6 space-y-4 sm:space-y-6 px-4">
        <div className="shrink-0 px-1">
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post Title"
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight border-none px-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40 leading-tight",
              errors.title && "placeholder:text-destructive/60",
            )}
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1 font-medium">
              {errors.title}
            </p>
          )}
        </div>

      <div className="flex-1 min-h-0 flex flex-col rounded-lg border bg-card shadow-sm overflow-hidden relative mb-6">
          {isUploading && (
            <div className="absolute top-2 right-2 z-20 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium flex items-center border shadow-sm">
              <Loader2 className="size-3 animate-spin mr-2" /> Uploading
              image...
            </div>
          )}

          <NovelEditor
            value={formData.content}
            onChange={(newContent) =>
              setFormData((prev) => ({ ...prev, content: newContent }))
            }
            onImageUpload={(file) => handleImageUpload(file, false)}
            minHeight="100%" 
            className="h-full border-none" // Remove border here since parent has it
            isRounded={false} // Remove internal rounding to fit parent
          />
        </div>

        {errors.content && (
          <Alert variant="destructive">
            <AlertDescription>{errors.content}</AlertDescription>
          </Alert>
        )}
      </div>
    </motion.div>
  );
}
