import React, { useState, useEffect, DragEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, GripVertical, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGetNavLinksAdminQuery,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
  useUpdateSectionOrderMutation,
} from "@/store/api/adminApi";
import { cn, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import { PageHeader, ManagerWrapper } from "./shared";
import { useIsMobile } from "@/hooks/use-mobile";

type NavLink = {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_visible: boolean;
};

const LinkForm = ({
  link,
  onSave,
  onCancel,
}: {
  link: Partial<NavLink> | null;
  onSave: (data: Partial<NavLink>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    label: link?.label || "",
    href: link?.href || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
      <div className="space-y-1">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) =>
            setFormData((f) => ({ ...f, label: e.target.value }))
          }
          required
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="href">Path (e.g., /about)</Label>
        <Input
          id="href"
          value={formData.href}
          onChange={(e) => setFormData((f) => ({ ...f, href: e.target.value }))}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Link</Button>
      </div>
    </form>
  );
};

export default function NavigationManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();

  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localLinks, setLocalLinks] = useState<NavLink[]>([]);
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);

  const { data: links = [], isLoading } = useGetNavLinksAdminQuery();
  const [saveNavLink] = useSaveNavLinkMutation();
  const [deleteNavLink] = useDeleteNavLinkMutation();
  

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const handleSave = async (data: Partial<NavLink>) => {
    try {
      await saveNavLink(data).unwrap();
      toast.success("Navigation link saved.");
      setIsSheetOpen(false);
    } catch (err) {
      toast.error("Failed to save link", { description: getErrorMessage(err) });
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Navigation Link?",
      description:
        "This will remove the link from your site's public navigation bar.",
      variant: "destructive",
      confirmText: "Delete",
    });

    if (!isConfirmed) return;
    try {
      await deleteNavLink(id).unwrap();
      toast.success("Navigation link deleted.");
      if (editingLink?.id === id) setIsSheetOpen(false);
    } catch (err) {
      toast.error("Failed to delete link", { description: getErrorMessage(err) });
    }
  };

  const handleToggleVisibility = async (link: NavLink) => {
    // Optimistic update for the edit sheet
    if (editingLink?.id === link.id) {
      setEditingLink({ ...editingLink, is_visible: !link.is_visible });
    }

    try {
      await saveNavLink({ id: link.id, is_visible: !link.is_visible }).unwrap();
      toast.success(
        `"${link.label}" is now ${!link.is_visible ? "visible" : "hidden"}.`,
      );
    } catch (err) {
      // Revert if failed
      if (editingLink?.id === link.id) {
        setEditingLink({ ...editingLink, is_visible: link.is_visible });
      }
      toast.error("Failed to update visibility", { description: getErrorMessage(err) });
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, linkId: string) => {
    if (isMobile) {
      e.preventDefault();
      return;
    }
    setDraggedLinkId(linkId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (targetLinkId: string) => {
    if (!draggedLinkId || draggedLinkId === targetLinkId) return;

    const reorderedLinks = [...localLinks];
    const draggedIndex = reorderedLinks.findIndex(
      (l) => l.id === draggedLinkId,
    );
    const targetIndex = reorderedLinks.findIndex((l) => l.id === targetLinkId);

    const [draggedItem] = reorderedLinks.splice(draggedIndex, 1);
    reorderedLinks.splice(targetIndex, 0, draggedItem);

    setLocalLinks(reorderedLinks);
    setDraggedLinkId(null);

    try {
      const updatePromises = reorderedLinks.map((link, index) =>
        saveNavLink({ id: link.id, display_order: index }),
      );
      await Promise.all(updatePromises);
      toast.success("Navigation order saved.");
    } catch {
      toast.error("Failed to save new order.");
      setLocalLinks(links);
    }
  };

  return (
    <ManagerWrapper>
      <PageHeader
        title="Navigation"
        description="Manage and reorder the main navigation links for your site."
        actions={
          <Button
            onClick={() => {
              setEditingLink(null);
              setIsSheetOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" /> Add Link
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            {isMobile
              ? "Manage your menu links."
              : "Drag and drop to reorder links."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {localLinks.map((link) => (
                <div
                  key={link.id}
                  draggable={!isMobile}
                  onDragStart={(e) => handleDragStart(e, link.id)}
                  onDrop={() => handleDrop(link.id)}
                  onDragOver={handleDragOver}
                  className={cn(
                    "flex items-center gap-3 rounded-md p-3 border bg-card transition-all hover:border-primary/50",
                    draggedLinkId === link.id && "opacity-50 scale-95",
                  )}
                >
                  {!isMobile && (
                    <GripVertical className="size-5 text-muted-foreground cursor-grab shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium truncate">{link.label}</p>
                      {isMobile && (
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            link.is_visible ? "bg-green-500" : "bg-muted",
                          )}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {link.href}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <Switch
                        checked={link.is_visible}
                        onCheckedChange={() => handleToggleVisibility(link)}
                        aria-label="Toggle visibility"
                      />
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingLink(link);
                        setIsSheetOpen(true);
                      }}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {localLinks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No links found. Add one to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>
                {editingLink ? "Edit" : "Add"} Navigation Link
              </SheetTitle>
              <SheetDescription>
                This link will appear in your site's main navigation bar.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </div>

          {/* Mobile Visibility Toggle in Edit Sheet */}
          {isMobile && editingLink && (
            <div className="flex items-center justify-between border rounded-md p-3 my-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label>Visible</Label>
                <p className="text-xs text-muted-foreground">Show in menu</p>
              </div>
              <Switch
                checked={editingLink.is_visible}
                onCheckedChange={() => handleToggleVisibility(editingLink)}
              />
            </div>
          )}

          <LinkForm
            link={editingLink}
            onSave={handleSave}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ManagerWrapper>
  );
}