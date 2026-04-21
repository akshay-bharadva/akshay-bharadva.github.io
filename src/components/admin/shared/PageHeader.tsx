import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SearchInput from "./SearchInput";

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  searchValue,
  onSearch,
  searchPlaceholder = "Search...",
  filters,
  sticky = false,
  className,
}: PageHeaderProps) {
  const hasSearch = searchValue !== undefined && onSearch !== undefined;

  return (
    <div
      className={cn(
        "space-y-4",
        sticky && "sticky top-0 z-20 bg-secondary/30 backdrop-blur border-b pb-4",
        className
      )}
    >
      {/* Title Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <div className="text-sm text-muted-foreground">
              {typeof description === "string" ? <p>{description}</p> : description}
            </div>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className={cn(
            "grid w-full grid-cols-1 gap-2", 
            "sm:flex sm:w-auto sm:items-center sm:shrink-0" 
          )}>
            {actions}
          </div>
        )}
      </div>

      {/* Search & Filters Row */}
      {(hasSearch || filters) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasSearch && (
            <SearchInput
              value={searchValue}
              onChange={onSearch}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 lg:w-80"
            />
          )}
          {filters && (
            <div className={cn(
               // Mobile: 1 Column Grid (Full Width)
               "grid w-full grid-cols-1 gap-2", 
               // Desktop: Auto-width Flex
               "sm:flex sm:w-auto sm:items-center"
            )}>
              {filters}
            </div>
          )}
        </div>
      )}
    </div>
  );
}