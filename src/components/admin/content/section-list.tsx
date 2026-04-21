import type { PortfolioSection } from "@/types";
import { ChevronUp, ChevronDown, Plus, Loader2, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface SectionListProps {
  groupedSections: Record<string, PortfolioSection[]>;
  selectedSectionId: string | null;
  isLoading: boolean;
  isMobile: boolean;
  onSelectSection: (id: string) => void;
  onNewSection: () => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
}

export default function SectionList({
  groupedSections,
  selectedSectionId,
  isLoading,
  isMobile,
  onSelectSection,
  onNewSection,
  onMoveUp,
  onMoveDown,
}: SectionListProps) {
  return (
    <div className="flex h-full flex-col bg-card">
      {!isMobile && (
        <div className="p-3 border-b bg-background/50 backdrop-blur-sm shrink-0">
          <Button onClick={onNewSection} className="w-full h-9 shadow-sm" variant="outline">
            <Plus className="mr-2 size-4" /> New Section
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1 bg-muted/5 h-full">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(groupedSections).length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-40">
            <LayoutTemplate className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No sections yet</p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={Object.keys(groupedSections)}
            className="w-full p-2 space-y-2"
          >
            {Object.entries(groupedSections).map(([path, sectionsInGroup]) => (
              <AccordionItem
                value={path}
                key={path}
                className="border rounded-lg bg-background shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="py-3 px-3 text-sm font-semibold hover:no-underline hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2 truncate">
                    <LayoutTemplate className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{path === "/" ? "Home Page" : path}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-0 px-2">
                  <div className="flex flex-col gap-1 mt-1">
                    {sectionsInGroup.map((section, index) => {
                      const isFirst = index === 0;
                      const isLast = index === sectionsInGroup.length - 1;

                      return (
                        <div
                          key={section.id}
                          className={cn(
                            "flex items-center gap-1 rounded-md transition-all group pr-1",
                            selectedSectionId === section.id ? "bg-secondary" : "hover:bg-muted"
                          )}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start h-10 md:h-9 cursor-pointer px-2 hover:bg-transparent font-normal",
                              selectedSectionId === section.id && "font-medium"
                            )}
                            onClick={() => onSelectSection(section.id)}
                          >
                            <span className="truncate text-left">{section.title}</span>
                          </Button>

                          {/* Move buttons - Always visible on mobile, hover on desktop */}
                          <div className={cn(
                            "flex gap-0.5",
                            !isMobile && "opacity-0 group-hover:opacity-100 transition-opacity"
                          )}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 md:size-7 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveUp(section.id);
                              }}
                              disabled={isFirst}
                            >
                              <ChevronUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 md:size-7 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveDown(section.id);
                              }}
                              disabled={isLast}
                            >
                              <ChevronDown className="size-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );
}