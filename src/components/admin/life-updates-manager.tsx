import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LifeUpdate } from "@/types";
import LifeUpdateEditor from "@/components/admin/life-update-editor";
import {
  useGetLifeUpdatesQuery,
  useUpdateLifeUpdateMutation,
  useDeleteLifeUpdateMutation,
} from "@/store/api/adminApi";
import {
  Pin,
  PinOff,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Megaphone,
  MoreHorizontal,
  Calendar,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { PageHeader, ManagerWrapper } from "./shared";
import { LIFE_UPDATE_CATEGORY_OPTIONS } from "@/lib/constants";

const getCategoryMeta = (category: string) =>
  LIFE_UPDATE_CATEGORY_OPTIONS.find((c) => c.value === category) || {
    value: category,
    label: category,
    emoji: "📝",
  };

/* ── Deterministic rotation from ID ── */
function getRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 5) - 2) * 0.7;
}

const tapeColors = [
  "bg-amber-300/50 dark:bg-amber-400/25",
  "bg-sky-300/50 dark:bg-sky-400/25",
  "bg-rose-300/50 dark:bg-rose-400/25",
  "bg-emerald-300/50 dark:bg-emerald-400/25",
  "bg-violet-300/50 dark:bg-violet-400/25",
];

function getTapeColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 2) + id.charCodeAt(i);
    hash |= 0;
  }
  return tapeColors[Math.abs(hash) % tapeColors.length];
}

/* ── Category accent ── */
const categoryBadgeClass: Record<string, string> = {
  watching: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  activity: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  photo: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  thought: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  milestone: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

/* ── Stats Row ── */
function StatsRow({ updates }: { updates: LifeUpdate[] }) {
  const published = updates.filter((u) => u.is_published).length;
  const drafts = updates.filter((u) => !u.is_published).length;
  const pinned = updates.filter((u) => u.is_pinned).length;

  const stats = [
    { label: "Published", value: published, accent: "text-primary" },
    { label: "Drafts", value: drafts, accent: "text-muted-foreground" },
    { label: "Pinned", value: pinned, accent: "text-amber-500" },
    { label: "Total", value: updates.length, accent: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-sm">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={cn("text-lg font-bold", s.accent)}>
              {s.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Actions Dropdown ── */
function UpdateActions({
  update,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublish,
}: {
  update: LifeUpdate;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>
          <Edit className="mr-2 size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onTogglePublish}>
          {update.is_published ? (
            <>
              <EyeOff className="mr-2 size-4" /> Unpublish
            </>
          ) : (
            <>
              <Eye className="mr-2 size-4" /> Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onTogglePin}>
          {update.is_pinned ? (
            <>
              <PinOff className="mr-2 size-4" /> Unpin
            </>
          ) : (
            <>
              <Pin className="mr-2 size-4" /> Pin
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
          <Trash2 className="mr-2 size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Board Card (Polaroid style) ── */
function BoardCard({
  update,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublish,
}: {
  update: LifeUpdate;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
}) {
  const cat = getCategoryMeta(update.category);
  const badgeClass = categoryBadgeClass[update.category] || "";
  const rotation = getRotation(update.id);
  const tape = getTapeColor(update.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: rotation * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{
        rotate: 0,
        scale: 1.02,
        y: -4,
        zIndex: 20,
        transition: { duration: 0.2 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="break-inside-avoid mb-4 pt-3 cursor-pointer"
      onClick={onEdit}
    >
      <div className="relative group">
        {/* Tape — straddles card top edge */}
        <div
          className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-4 w-12 ${tape} rounded-sm z-10 rotate-[-0.5deg]`}
        />

        {/* Pinned indicator */}
        {update.is_pinned && (
          <div className="absolute -top-0.5 right-1.5 z-20">
            <div className="size-5 rounded-full bg-red-500 shadow-md flex items-center justify-center">
              <Pin className="size-2.5 text-white rotate-45" fill="currentColor" />
            </div>
          </div>
        )}

        <div
          className={cn(
            "bg-card border border-border/50 rounded-sm shadow-[0_2px_12px_-3px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.35)] transition-shadow duration-300 group-hover:shadow-[0_6px_24px_-5px_rgba(0,0,0,0.18)] dark:group-hover:shadow-[0_6px_24px_-5px_rgba(0,0,0,0.45)] overflow-hidden",
            !update.is_published && "opacity-55",
          )}
        >
          {/* Image */}
          {update.image_url && (
            <div className="mx-2 mt-2 overflow-hidden rounded-sm bg-secondary/20">
              <img
                src={update.image_url}
                alt={update.title || ""}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-3 pt-2">
            {/* Top row: emoji + actions */}
            <div className="flex items-start justify-between mb-1">
              <span className="text-base">{cat.emoji}</span>
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <UpdateActions
                  update={update}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                  onTogglePublish={onTogglePublish}
                />
              </div>
            </div>

            {/* Title */}
            {update.title ? (
              <h3 className="font-semibold text-sm text-foreground leading-tight truncate mb-0.5">
                {update.title}
              </h3>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Untitled
              </span>
            )}

            {/* Content preview */}
            {update.content && (
              <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                {update.content}
              </p>
            )}

            {/* Tags */}
            {update.tags && update.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {update.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-muted-foreground/60 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={update.is_published ? "default" : "secondary"}
                  className={cn(
                    "text-[9px] h-4 px-1.5",
                    update.is_published &&
                      "bg-primary/15 text-primary border-primary/20",
                  )}
                >
                  {update.is_published ? "Live" : "Draft"}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] h-4 px-1.5 rounded-full",
                    badgeClass,
                  )}
                >
                  {cat.label}
                </Badge>
              </div>
              <span className="text-[9px] text-muted-foreground/70">
                {update.updated_at
                  ? formatDistanceToNow(new Date(update.updated_at), {
                      addSuffix: true,
                    })
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── List Row (compact alternative) ── */
function ListRow({
  update,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublish,
}: {
  update: LifeUpdate;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
}) {
  const cat = getCategoryMeta(update.category);
  const badgeClass = categoryBadgeClass[update.category] || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer border border-transparent hover:border-border/40",
        !update.is_published && "opacity-55",
      )}
      onClick={onEdit}
    >
      {/* Thumbnail / Emoji */}
      {update.image_url ? (
        <div className="h-10 w-10 shrink-0 rounded-md border bg-secondary/50 overflow-hidden">
          <img
            src={update.image_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-md border bg-secondary/30 flex items-center justify-center text-lg">
          {cat.emoji}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {update.is_pinned && (
            <Pin
              className="size-3 text-primary rotate-45 shrink-0"
              fill="currentColor"
            />
          )}
          <span className="font-medium text-sm truncate">
            {update.title || (
              <span className="italic text-muted-foreground font-normal">
                Untitled
              </span>
            )}
          </span>
        </div>
        {update.content && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {update.content}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] h-4 px-1.5 rounded-full",
            badgeClass,
          )}
        >
          {cat.label}
        </Badge>
        <Badge
          variant={update.is_published ? "default" : "secondary"}
          className={cn(
            "text-[9px] h-4 px-1.5",
            update.is_published &&
              "bg-primary/15 text-primary border-primary/20",
          )}
        >
          {update.is_published ? "Live" : "Draft"}
        </Badge>
      </div>

      <span className="hidden md:block text-[10px] text-muted-foreground/60 shrink-0 w-20 text-right">
        {update.updated_at
          ? formatDistanceToNow(new Date(update.updated_at), {
              addSuffix: true,
            })
          : ""}
      </span>

      {/* Actions */}
      <div
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <UpdateActions
          update={update}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onTogglePublish={onTogglePublish}
        />
      </div>
    </motion.div>
  );
}

/* ── Main Manager ── */
export default function LifeUpdatesManager() {
  const confirm = useConfirm();
  const [editingUpdate, setEditingUpdate] = useState<LifeUpdate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("list");

  const { data: updates = [], isLoading } = useGetLifeUpdatesQuery();
  const [updateLifeUpdate] = useUpdateLifeUpdateMutation();
  const [deleteLifeUpdate] = useDeleteLifeUpdateMutation();

  const filteredUpdates = useMemo(() => {
    const sorted = [...updates].sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return (
          new Date(b.updated_at || 0).getTime() -
          new Date(a.updated_at || 0).getTime()
        );
      }
      return a.is_pinned ? -1 : 1;
    });

    return sorted
      .filter((u) => {
        if (!selectedCategory) return true;
        return u.category === selectedCategory;
      })
      .filter((u) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          u.title?.toLowerCase().includes(term) ||
          u.content?.toLowerCase().includes(term) ||
          u.tags?.some((tag) => tag.toLowerCase().includes(term))
        );
      });
  }, [updates, searchTerm, selectedCategory]);

  const handleCreate = () => {
    setEditingUpdate(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (update: LifeUpdate) => {
    setEditingUpdate(update);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Update?",
      description: "This action cannot be undone.",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteLifeUpdate(id).unwrap();
      toast.success("Update deleted.");
    } catch (err: unknown) {
      toast.error("Failed to delete", { description: getErrorMessage(err) });
    }
  };

  const handleTogglePin = async (update: LifeUpdate) => {
    try {
      await updateLifeUpdate({
        id: update.id,
        is_pinned: !update.is_pinned,
      }).unwrap();
      toast.success(update.is_pinned ? "Unpinned." : "Pinned.");
    } catch (err: unknown) {
      toast.error("Failed to update", { description: getErrorMessage(err) });
    }
  };

  const handleTogglePublish = async (update: LifeUpdate) => {
    try {
      await updateLifeUpdate({
        id: update.id,
        is_published: !update.is_published,
      }).unwrap();
      toast.success(update.is_published ? "Unpublished." : "Published!");
    } catch (err: unknown) {
      toast.error("Failed to update", { description: getErrorMessage(err) });
    }
  };

  if (isLoading && !updates.length)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );

  const actionProps = (update: LifeUpdate) => ({
    onEdit: () => handleEdit(update),
    onDelete: () => handleDelete(update.id),
    onTogglePin: () => handleTogglePin(update),
    onTogglePublish: () => handleTogglePublish(update),
  });

  return (
    <ManagerWrapper>
      <PageHeader
        title="Life Updates"
        description="Share what you're watching, doing, and thinking"
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* View toggle */}
            <div className="hidden sm:flex items-center border rounded-lg p-0.5 bg-secondary/30">
              <Button
                variant={viewMode === "board" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("board")}
                title="Board view"
              >
                <Grid3X3 className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="size-3.5" />
              </Button>
            </div>
            <Button onClick={handleCreate} className="h-9 flex-1 sm:flex-none">
              <Plus className="mr-2 size-4" /> New Update
            </Button>
          </div>
        }
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search updates..."
      />

      {/* Stats */}
      {updates.length > 0 && <StatsRow updates={updates} />}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Desktop sidebar */}
        <aside className="w-44 hidden md:block sticky top-20 shrink-0">
          <h4 className="font-semibold text-xs mb-2 px-2 text-muted-foreground uppercase tracking-wider">
            Categories
          </h4>
          <div className="flex flex-col gap-0.5">
            <Button
              variant={!selectedCategory ? "secondary" : "ghost"}
              className={cn(
                "justify-start h-8 text-xs",
                !selectedCategory && "bg-secondary font-medium",
              )}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              <Megaphone className="mr-2 size-3.5" />
              All Updates
              <span className="ml-auto text-[10px] text-muted-foreground">
                {updates.length}
              </span>
            </Button>
            {LIFE_UPDATE_CATEGORY_OPTIONS.map((cat) => {
              const count = updates.filter(
                (u) => u.category === cat.value,
              ).length;
              return (
                <Button
                  key={cat.value}
                  variant={
                    selectedCategory === cat.value ? "secondary" : "ghost"
                  }
                  className={cn(
                    "justify-start h-8 text-xs text-muted-foreground",
                    selectedCategory === cat.value &&
                      "text-foreground font-medium",
                  )}
                  onClick={() => setSelectedCategory(cat.value)}
                  size="sm"
                >
                  <span className="mr-2 text-sm">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full min-w-0">
          {/* Mobile category scroll */}
          <div className="md:hidden mb-4">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={!selectedCategory ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full h-7 text-xs"
                >
                  All
                </Button>
                {LIFE_UPDATE_CATEGORY_OPTIONS.map((cat) => (
                  <Button
                    key={cat.value}
                    size="sm"
                    variant={
                      selectedCategory === cat.value ? "default" : "outline"
                    }
                    onClick={() =>
                      setSelectedCategory(
                        cat.value === selectedCategory ? null : cat.value,
                      )
                    }
                    className="rounded-full h-7 text-xs"
                  >
                    {cat.emoji} {cat.label}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {!isLoading && filteredUpdates.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <Megaphone className="mx-auto size-12 opacity-20" />
              <h3 className="mt-4 text-lg font-semibold">No Updates Found</h3>
              <p className="mt-1 text-sm text-muted-foreground/80">
                {searchTerm
                  ? "Try a different search."
                  : "Share your first life update!"}
              </p>
            </div>
          ) : viewMode === "board" ? (
            /* ── Board View (Polaroid Pin-board) ── */
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              <AnimatePresence>
                {filteredUpdates.map((update) => (
                  <BoardCard
                    key={update.id}
                    update={update}
                    {...actionProps(update)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ── List View ── */
            <Card className="shadow-sm">
              <div className="p-1">
                <AnimatePresence>
                  {filteredUpdates.map((update) => (
                    <ListRow
                      key={update.id}
                      update={update}
                      {...actionProps(update)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )}
        </main>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col h-full">
          <LifeUpdateEditor
            key={editingUpdate?.id || "new"}
            update={editingUpdate}
            onSuccess={() => setIsSheetOpen(false)}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ManagerWrapper>
  );
}
