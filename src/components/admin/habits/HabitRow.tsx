import React, { useMemo } from "react";
import { format } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Flame, MoreVertical, Edit2, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateHabitStats } from "@/lib/habit-utils";
import confetti from "canvas-confetti";
import HabitCell from "./HabitCell";

interface HabitRowProps {
  habit: Habit;
  dates: Date[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onViewStats: (habit: Habit) => void;
}

const HabitRow = React.memo(
  ({
    habit,
    dates,
    onToggle,
    onEdit,
    onDelete,
    onViewStats,
  }: HabitRowProps) => {
    const { streak, completionRate } = useMemo(
      () => calculateHabitStats(habit),
      [habit],
    );

    const completedDatesSet = useMemo(
      () => new Set(habit.habit_logs?.map((l) => l.completed_date) || []),
      [habit.habit_logs],
    );

    const handleCheck = (dateStr: string) => {
      const isAlreadyDone = completedDatesSet.has(dateStr);
      if (!isAlreadyDone) {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: [habit.color || "#60a5fa", "#ffffff"],
          disableForReducedMotion: true,
        });
      }
      onToggle(habit.id, dateStr);
    };

    return (
      <TableRow className="hover:bg-muted/20">
        {/* Sticky Habit Name Column */}
        <TableCell
          className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] sticky left-0 bg-background/95 backdrop-blur z-10 border-r p-3"
          onClick={() => onViewStats(habit)}
        >
          <div className="flex flex-col justify-center h-full gap-0.5 cursor-pointer">
            <p className="font-semibold text-sm truncate text-foreground">
              {habit.title}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {habit.target_per_week}/wk • {completionRate}%
            </p>
          </div>
        </TableCell>

        {/* Date Cells */}
        {dates.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          return (
            <TableCell key={dateStr} className="p-0 text-center w-11 min-w-[44px]">
              <HabitCell
                dateStr={dateStr}
                isCompleted={completedDatesSet.has(dateStr)}
                color={habit.color}
                onToggle={() => handleCheck(dateStr)}
                isToday={date.toDateString() === new Date().toDateString()}
              />
            </TableCell>
          );
        })}

        {/* Sticky Stats Column */}
        <TableCell className="w-[60px] min-w-[60px] sticky right-0 bg-background/95 backdrop-blur z-10 border-l px-1">
          <div className="flex items-center justify-center gap-1">
            <div
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border",
                streak > 0
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-500/20"
                  : "bg-muted/50 text-muted-foreground border-transparent",
              )}
            >
              <span>{streak}</span>
              <Flame className="size-3" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground">
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewStats(habit)}>
                  <BarChart2 className="mr-2 size-3.5" /> Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Edit2 className="mr-2 size-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(habit.id)}>
                  <Trash2 className="mr-2 size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    );
  },
);

HabitRow.displayName = "HabitRow";
export default HabitRow;