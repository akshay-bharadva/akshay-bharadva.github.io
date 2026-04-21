import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { VIEW_OPTIONS } from "./constants";

export interface CalendarTopBarProps {
  currentDate: Date;
  activeView: string;
  searchQuery: string;
  showSearch: boolean;
  onSearchQueryChange: (query: string) => void;
  onShowSearchChange: (show: boolean) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChangeView: (viewKey: string) => void;
  onAddNewEvent: () => void;
}

export default function CalendarTopBar({
  currentDate,
  activeView,
  searchQuery,
  showSearch,
  onSearchQueryChange,
  onShowSearchChange,
  onToday,
  onPrev,
  onNext,
  onChangeView,
  onAddNewEvent,
}: CalendarTopBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
      <h1 className="text-lg font-semibold text-foreground shrink-0">
        Calendar
      </h1>

      {/* Today + Nav + Month Title */}
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-sm font-medium px-4 h-8"
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </Button>
        <h2 className="text-base font-medium text-foreground ml-2 hidden sm:block whitespace-nowrap">
          {format(currentDate, "MMM yyyy")}
        </h2>
      </div>

      {/* Right: Search + View Switcher + Create */}
      <div className="flex items-center gap-2 ml-auto">
        {showSearch ? (
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="h-8 w-48 pl-8 pr-8 text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                onShowSearchChange(false);
                onSearchQueryChange("");
              }}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => onShowSearchChange(true)}
          >
            <Search className="size-4" />
          </Button>
        )}

        {/* View Switcher — active state tracked */}
        <div className="hidden lg:flex items-center bg-secondary/50 rounded-lg p-0.5 gap-0.5">
          {VIEW_OPTIONS.map((view) => (
            <button
              key={view.key}
              onClick={() => onChangeView(view.key)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                activeView === view.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>

        <Button
          onClick={onAddNewEvent}
          size="sm"
          className="h-9 gap-2 rounded-full px-4 shadow-md"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </div>
    </div>
  );
}
