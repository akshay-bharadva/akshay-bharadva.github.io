import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Briefcase,
  ListTodo,
  CheckSquare,
  Banknote,
  TrendingUp,
} from "lucide-react";

export interface CalendarFiltersProps {
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export default function CalendarFilters({
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  return (
    <ToggleGroup
      type="multiple"
      value={filters}
      onValueChange={onFiltersChange}
      size="sm"
      className="
        bg-secondary/50 p-1 rounded-lg border border-border/50 
        flex w-full justify-between sm:w-auto sm:justify-start
      " 
      // ^ CHANGED: w-full on mobile, auto on desktop. justify-between spreads them out.
    >
      <ToggleGroupItem
        value="event"
        aria-label="Events"
        className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary sm:flex-none"
        // ^ CHANGED: flex-1 makes it fill space on mobile, flex-none reverts it on desktop
      >
        <Briefcase className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Events</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="task"
        aria-label="Tasks"
        className="flex-1 data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-600 dark:data-[state=on]:text-yellow-400 sm:flex-none"
      >
        <ListTodo className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Tasks</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="habit_summary"
        aria-label="Habits"
        className="flex-1 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-600 dark:data-[state=on]:text-blue-400 sm:flex-none"
      >
        <CheckSquare className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Habits</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="transaction_summary"
        aria-label="Transactions"
        className="flex-1 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-400 sm:flex-none"
      >
        <Banknote className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Finance</span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="forecast"
        aria-label="Forecast"
        className="flex-1 data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-600 dark:data-[state=on]:text-purple-400 sm:flex-none"
      >
        <TrendingUp className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Forecast</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}