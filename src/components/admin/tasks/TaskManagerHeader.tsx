import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, List, Plus, Search, Filter } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HeaderProps {
  view: "board" | "table";
  setView: (v: "board" | "table") => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onNewTask: () => void;
  isMobile: boolean;
  // Made optional to fix build error if parent doesn't pass them yet
  showCompleted?: boolean;
  setShowCompleted?: (b: boolean) => void;
}

export function TaskManagerHeader({
  view,
  setView,
  searchTerm,
  setSearchTerm,
  onNewTask,
  isMobile,
  showCompleted,
  setShowCompleted,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b bg-background/95 backdrop-blur pb-4 pt-2 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Manage projects, track progress, and organize your workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onNewTask} size="sm" className="h-9 shadow-sm">
            <Plus className="mr-2 size-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between px-1">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-muted-foreground/20"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
                <Filter className="size-4 mr-2" />
                <span className="hidden lg:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Only render if props are provided */}
              {setShowCompleted && (
                <DropdownMenuCheckboxItem
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                >
                  Show Completed
                </DropdownMenuCheckboxItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View toggle - board disabled on mobile */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => {
              if (v && !(isMobile && v === "board")) {
                setView(v as "board" | "table");
              }
            }}
            size="sm"
          >
            <ToggleGroupItem
              value="table"
              aria-label="Table View"
              className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <List className="size-4 mr-2" /> Table
            </ToggleGroupItem>
            <ToggleGroupItem
              value="board"
              aria-label="Board View"
              disabled={isMobile}
              title={isMobile ? "Board view is not available on mobile" : undefined}
              className="data-[state=on]:bg-background data-[state=on]:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LayoutGrid className="size-4 mr-2" /> Board
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}