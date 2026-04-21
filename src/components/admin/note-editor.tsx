import React, { useState, useEffect } from "react";
import type { Note } from "@/types";
import {
  useAddNoteMutation,
  useUpdateNoteMutation,
} from "@/store/api/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, Check, Palette } from "lucide-react";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import NovelEditor from "@/components/admin/novel-editor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

// Google Keep-ish Pastel Colors
const NOTE_COLORS = [
  "#f87171", // Red
  "#fb923c", // Orange
  "#facc15", // Yellow
  "#4ade80", // Green
  "#22d3ee", // Cyan
  "#60a5fa", // Blue
  "#c084fc", // Purple
  "#e879f9", // Pink
];

interface NoteEditorProps {
  note: Note | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NoteEditor({
  note,
  onCancel,
  onSuccess,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [color, setColor] = useState<string | null>(null);

  const [addNote, { isLoading: isAdding }] = useAddNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const isLoading = isAdding || isUpdating;

  // Initialize state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags?.join(", ") || "");
      setColor(note.color || null);
    } else {
      // Reset for new note
      setTitle("");
      setContent("");
      setTags("");
      setColor(null);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const noteDataToSave: Partial<Note> = {
      title: title || null,
      content: content || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      color: color,
    };

    try {
      if (note?.id) {
        await updateNote({ ...noteDataToSave, id: note.id }).unwrap();
      } else {
        await addNote(noteDataToSave).unwrap();
      }
      toast.success("Note saved successfully.");
      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to save note", { description: getErrorMessage(err) });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header - Fixed */}
      <div className="flex shrink-0 justify-between items-center py-4 border-b">
        <div className="space-y-1">
          <SheetTitle>{note?.id ? "Edit Note" : "Create New Note"}</SheetTitle>
          <SheetDescription className="text-xs">
            Capture your ideas.
          </SheetDescription>
        </div>
        <SheetClose asChild>
          <Button type="button" variant="ghost">
            <X />
          </Button>
        </SheetClose>
      </div>

      {/* Main Form Area - Flex Grow */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col min-h-0 pt-4"
      >
        {/* Title & Color Row */}
        <div className="flex gap-2 items-center mb-4 shrink-0">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="font-bold text-lg h-12 border-transparent px-2 shadow-none focus-visible:ring-0 focus-visible:bg-secondary/20 placeholder:text-muted-foreground/50"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                style={{
                  backgroundColor: color ? `${color}40` : undefined,
                  border: color ? `1px solid ${color}` : undefined,
                }}
              >
                <Palette
                  className={cn(
                    "size-5",
                    color ? "text-foreground" : "text-muted-foreground",
                  )}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setColor(null)}
                  className="h-8 w-8 rounded-full border border-dashed flex items-center justify-center hover:bg-muted"
                  title="Default"
                >
                  <X className="size-3 text-muted-foreground" />
                </button>
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-black/5 dark:border-white/10"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <Check className="size-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Editor Container - The Scrolling Part */}
        <div className="flex-1 min-h-0 border rounded-md bg-card overflow-hidden flex flex-col">
          <NovelEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing..."
            minHeight="100%"
            isRounded={false}
            className="h-full border-none" // This ensures the editor fills the container
          />
        </div>

        {/* Tags Input - Fixed at bottom */}
        <div className="shrink-0 pt-4">
          <Label htmlFor="tags" className="text-xs text-muted-foreground ml-1">
            Tags (comma-separated)
          </Label>
          <div className="flex items-center gap-2 mt-1.5 border rounded-md px-3 bg-background focus-within:ring-1 focus-within:ring-ring">
            <span className="text-muted-foreground">#</span>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, ideas..."
              className="border-none shadow-none focus-visible:ring-0 h-9 p-0"
            />
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="flex shrink-0 justify-end gap-3 pt-6 mt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
