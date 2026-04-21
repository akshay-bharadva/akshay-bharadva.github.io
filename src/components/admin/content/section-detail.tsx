import { useState, useEffect, useCallback } from "react";
import type { PortfolioSection, PortfolioItem } from "@/types";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  LayoutTemplate,
  MoreVertical,
  LinkIcon,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import NovelEditor from "@/components/admin/novel-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SectionDetailProps {
  section: PortfolioSection | null;
  isMobile: boolean;
  onBack: () => void;
  onEditSection: (section: PortfolioSection) => void;
  onDeleteSection: (id: string) => void;
  onSaveContent: (
    data: { id: string; content: string },
    options?: { silent?: boolean },
  ) => void;
  onNewItem: (sectionId: string) => void;
  onEditItem: (item: PortfolioItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function SectionDetail({
  section,
  isMobile,
  onBack,
  onEditSection,
  onDeleteSection,
  onSaveContent,
  onNewItem,
  onEditItem,
  onDeleteItem,
}: SectionDetailProps) {
  const [content, setContent] = useState(section?.content || "");

  // Update content when section changes
  useEffect(() => {
    setContent(section?.content || "");
  }, [section?.id, section?.content]);

  // Autosave content with debounce
  useEffect(() => {
    if (!section || content === (section.content || "")) return;
    const handler = setTimeout(() => {
      onSaveContent({ id: section.id, content });
    }, 2000);
    return () => clearTimeout(handler);
  }, [content, section, onSaveContent]);

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center text-center text-muted-foreground bg-muted/5">
        <div className="max-w-xs">
          <LayoutTemplate className="mx-auto size-12 opacity-20 mb-4" />
          <p>Select a section from the list to edit its content and items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="-ml-2 shrink-0"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight truncate">
                {section.title}
              </h2>
              {!isMobile && (
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded capitalize">
                    {section.type.replace("_", " ")}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{section.layout_style}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditSection(section)}>
                    <Edit className="mr-2 size-4" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDeleteSection(section.id)}
                  >
                    <Trash2 className="mr-2 size-4" /> Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditSection(section)}
                >
                  <Edit className="mr-2 size-4" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteSection(section.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6 md:px-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {section.type === "markdown" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Content</Label>
                <span className="text-xs text-muted-foreground">
                  Auto-saving
                </span>
              </div>
              <div className="rounded-lg min-h-[500px] w-full max-w-full overflow-hidden">
                <NovelEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your section content here..."
                  minHeight="500px"
                  className="prose-sm sm:prose max-w-none"
                />
              </div>
            </div>
          )}

          {(section.type === "list_items" || section.type === "gallery") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-background/95 py-2 z-10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Items{" "}
                  <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-muted-foreground">
                    {section.portfolio_items?.length || 0}
                  </span>
                </h3>
                <Button size="sm" onClick={() => onNewItem(section.id)}>
                  <Plus className="mr-2 size-4" />{" "}
                  <span className="hidden xs:inline">Add Item</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </div>
              <div className="grid gap-3">
                {section.portfolio_items?.map((item) => (
                  <>
                    <Card
                      key={item.id}
                      className="group flex flex-col sm:flex-row p-4 gap-4 hover:border-primary/50 transition-all relative overflow-hidden"
                    >
                      {item.image_url && (
                        <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-md bg-secondary overflow-hidden">
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-base leading-tight truncate text-wrap">
                              {item.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.subtitle}
                            </p>
                          </div>
                          {/* Mobile Actions: Absolute top-right to save space */}
                          {isMobile && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 -mr-2 -mt-2"
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEditItem(item)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => onDeleteItem(item.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {(item.date_from || item.date_to) && (
                            <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                              <Calendar className="size-3" />
                              <span>
                                {item.date_from || "?"} -{" "}
                                {item.date_to || "Present"}
                              </span>
                            </div>
                          )}
                          {item.link_url && (
                            <a
                              href={item.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <LinkIcon className="size-3" /> Link
                            </a>
                          )}
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, isMobile ? 3 : 5).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] border px-1.5 rounded-sm bg-background/50"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > (isMobile ? 3 : 5) && (
                              <span className="text-[10px] text-muted-foreground">
                                +{item.tags.length - (isMobile ? 3 : 5)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Desktop Actions: Hover only */}
                      {!isMobile && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center pl-2 border-l ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditItem(item)}
                            title="Edit"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  </>
                ))}
                {(!section.portfolio_items ||
                  section.portfolio_items.length === 0) && (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                    No items yet. Click "Add Item" to create one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
