import React, { useMemo, useRef, useEffect } from "react";
import { format, subDays, isSameDay } from "date-fns";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import HabitRow from "./HabitRow";
import { useResponsiveDays } from "@/hooks/use-responsive-days"; // Import our new hook
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HabitGridProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onViewStats: (habit: Habit) => void;
}

export default function HabitGrid({
  habits,
  onToggle,
  onEdit,
  onDelete,
  onViewStats,
}: HabitGridProps) {
  const daysToShow = useResponsiveDays(); // Use the hook instead of isMobile
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) =>
      subDays(new Date(), daysToShow - 1 - i),
    );
  }, [daysToShow]);

  // Auto-scroll to the end (today's date) on load or when days change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollLeft = scrollAreaRef.current.scrollWidth;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [habits, daysToShow]);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="min-w-full inline-block align-middle" ref={scrollAreaRef}>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[120px] sm:w-[160px] min-w-[120px] sm:min-w-[160px] pl-4 h-12 sticky left-0 bg-background/95 backdrop-blur z-20 border-r">
                  Habit
                </TableHead>
                {dates.map((date) => (
                  <TableHead
                    key={date.toString()}
                    className="p-0 h-12 w-11 min-w-[44px] text-center align-middle font-normal"
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {format(date, "EEE")}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full",
                          isSameDay(date, new Date())
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80",
                        )}
                      >
                        {format(date, "d")}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center w-[60px] min-w-[60px] sticky right-0 bg-background/95 backdrop-blur z-20 border-l">
                  Stats
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  dates={dates}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewStats={onViewStats}
                />
              ))}
              {habits.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={daysToShow + 2}
                    className="h-40 text-center text-muted-foreground"
                  >
                    No habits found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}