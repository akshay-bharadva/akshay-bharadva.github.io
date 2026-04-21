import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Habit } from "@/types";
import {
  eachDayOfInterval,
  subDays,
  format,
  isSameDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HabitHeatmapModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HabitHeatmapModal({
  habit,
  isOpen,
  onClose,
}: HabitHeatmapModalProps) {
  if (!habit) return null;

  // Generate days for the current year
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfYear(today),
    end: endOfYear(today),
  });

  const logsSet = new Set(habit.habit_logs?.map((l) => l.completed_date) || []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            {habit.title}
          </DialogTitle>
          <DialogDescription>Yearly consistency view.</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isDone = logsSet.has(dateStr);
              const isFuture = day > today;

              return (
                <TooltipProvider key={dateStr} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "size-3 rounded-[2px] transition-colors",
                          isFuture
                            ? "bg-muted/20"
                            : isDone
                              ? "opacity-100"
                              : "bg-muted",
                        )}
                        style={{
                          backgroundColor: isDone ? habit.color : undefined,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {format(day, "MMM do")}: {isDone ? "Done" : "Missed"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
