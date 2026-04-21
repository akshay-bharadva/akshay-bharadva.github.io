import React from "react";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AssetBreadcrumbsProps {
  currentPath: string[];
  onNavigateRoot: () => void;
  onNavigateToBreadcrumb: (index: number) => void;
}

export default function AssetBreadcrumbs({
  currentPath,
  onNavigateRoot,
  onNavigateToBreadcrumb,
}: AssetBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground overflow-x-auto no-scrollbar">
      <button
        onClick={onNavigateRoot}
        className={cn(
          "flex items-center hover:text-primary transition-colors",
          currentPath.length === 0 && "text-foreground font-semibold"
        )}
      >
        <Home className="size-3.5 mr-1" /> Root
      </button>
      {currentPath.map((folder, i) => (
        <React.Fragment key={folder + i}>
          <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
          <button
            onClick={() => onNavigateToBreadcrumb(i)}
            className={cn(
              "whitespace-nowrap hover:text-primary transition-colors",
              i === currentPath.length - 1 && "text-foreground font-semibold"
            )}
          >
            {folder}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
