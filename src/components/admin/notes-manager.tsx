import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/types";
import NoteEditor from "@/components/admin/note-editor";
import {
  useGetNotesQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from "@/store/api/adminApi";
import {
  Pin,
  PinOff,
  Edit,
  Trash2,
  Plus,
  StickyNote,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent } from "../ui/sheet";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import ReactMarkdown from "react-markdown";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { PageHeader, ManagerWrapper } from "./shared";

// --- Updated NoteCard to look like Google Keep ---
const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    // break-inside-avoid is crucial for CSS Columns (Masonry) layout
    className="break-inside-avoid mb-4"
  >
    <Card
      className={cn(
        "flex flex-col hover:shadow-lg transition-all duration-300 relative overflow-hidden border-border/60",
      )}
      style={{
        // Apply a subtle tint of the color to the whole background
        backgroundColor: note.color ? `${note.color}15` : undefined, // 15 = low opacity hex
        borderColor: note.color ? `${note.color}50` : undefined,
      }}
    >
      <CardHeader className="pb-1 pt-4 px-4">
        <div className="flex justify-between items-start gap-2">
           {note.title ? (
            <h3 className="font-semibold text-foreground leading-tight">
              {note.title}
            </h3>
           ) : (
             <span className="text-muted-foreground italic text-sm">Untitled</span>
           )}
           {note.is_pinned && (
            <Pin className="size-3.5 text-primary shrink-0 rotate-45" fill="currentColor" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-2 px-4">
        <div className="prose prose-sm dark:prose-invert text-muted-foreground/90 line-clamp-[8] text-sm">
          {/* Render simple markdown or fallback text */}
          <ReactMarkdown 
             components={{
                p: ({node, ...props}) => <p {...props} className="mb-1 last:mb-0" />
             }}
          >
            {note.content || ""}
          </ReactMarkdown>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 pt-2 pb-3 px-3 mt-auto">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-[10px] h-5 px-1.5 bg-background/50 hover:bg-background/80"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions fade in on hover (desktop) or visible (mobile) */}
        <div className="flex w-full items-center justify-between mt-1 pt-2 border-t border-black/5 dark:border-white/5 opacity-80 group-hover:opacity-100">
            <span className="text-[10px] text-muted-foreground">
              {note.updated_at && formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </span>
            
            <div className="flex items-center -mr-2">
                <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                title={note.is_pinned ? "Unpin" : "Pin"}
                >
                {note.is_pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                </Button>
                <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title="Edit"
                >
                <Edit className="size-3.5" />
                </Button>
                <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-red-500/20 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete"
                >
                <Trash2 className="size-3.5" />
                </Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  </motion.div>
);

export default function NotesManager() {
  const confirm = useConfirm();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: notes = [], isLoading } = useGetNotesQuery();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const uniqueTags = useMemo(() => {
    const allTags = new Set<string>();
    notes.forEach((note) => note.tags?.forEach((tag) => allTags.add(tag)));
    return Array.from(allTags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    // 1. Sort: Pinned first, then by updated_at desc
    const sorted = [...notes].sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        }
        return a.is_pinned ? -1 : 1;
    });

    // 2. Filter
    return sorted
      .filter((note) => {
        if (!selectedTag) return true;
        return note.tags?.includes(selectedTag);
      })
      .filter((note) => {
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          note.title?.toLowerCase().includes(lowercasedTerm) ||
          note.content?.toLowerCase().includes(lowercasedTerm) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(lowercasedTerm))
        );
      });
  }, [notes, searchTerm, selectedTag]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsSheetOpen(true);
  };
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsSheetOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await confirm({
      title: "Delete Note?",
      description: "This action cannot be undone.",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteNote(noteId).unwrap();
      toast.success("Note deleted.");
    } catch (err: unknown) {
      toast.error("Failed to delete note", { description: getErrorMessage(err) });
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await updateNote({ id: note.id, is_pinned: !note.is_pinned }).unwrap();
      toast.success(note.is_pinned ? "Note unpinned." : "Note pinned.");
    } catch (err: unknown) {
      toast.error("Failed to update pin status", { description: getErrorMessage(err) });
    }
  };

  if (isLoading && !notes.length)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <ManagerWrapper>
      <PageHeader
        title="Notes"
        description="Capture thoughts and ideas"
        actions={
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 size-4" /> New Note
          </Button>
        }
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search notes..."
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Desktop Sidebar Tags */}
        <aside className="w-48 hidden md:block sticky top-20 shrink-0">
          <h4 className="font-semibold text-sm mb-3 px-2 text-muted-foreground">Labels</h4>
          <div className="flex flex-col gap-1">
            <Button
              variant={!selectedTag ? "secondary" : "ghost"}
              className={cn("justify-start", !selectedTag && "bg-secondary font-medium")}
              onClick={() => setSelectedTag(null)}
              size="sm"
            >
              <StickyNote className="mr-2 size-3.5" />
              All Notes
            </Button>
            {uniqueTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "secondary" : "ghost"}
                className={cn("justify-start text-muted-foreground", selectedTag === tag && "text-foreground font-medium")}
                onClick={() => setSelectedTag(tag)}
                size="sm"
              >
                <Tag className="mr-2 size-3.5" />
                <span className="truncate">{tag}</span>
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          {/* Mobile Tag Filter */}
          <div className="md:hidden mb-4">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={!selectedTag ? "default" : "outline"}
                  onClick={() => setSelectedTag(null)}
                  className="rounded-full h-7 text-xs"
                >
                  All
                </Button>
                {uniqueTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() =>
                      setSelectedTag(tag === selectedTag ? null : tag)
                    }
                    className="rounded-full h-7 text-xs"
                  >
                    # {tag}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {!isLoading && filteredNotes.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <StickyNote className="mx-auto size-12 opacity-20" />
              <h3 className="mt-4 text-lg font-semibold">No Notes Found</h3>
              <p className="mt-1 text-sm text-muted-foreground/80">
                {searchTerm ? "Try a different search." : "Create your first note to get started!"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
               {/* 
                 MASONRY LAYOUT
                 Using CSS Columns (columns-1, columns-2, etc) creates a masonry effect
                 where items stack naturally based on height.
               */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {/* h-full ensures the sheet content takes full height of the viewport */}
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col h-full">
          {/* Key forces re-render if note changes */}
          <NoteEditor
            key={editingNote?.id || "new"}
            note={editingNote}
            onSuccess={() => setIsSheetOpen(false)}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ManagerWrapper>
  );
}