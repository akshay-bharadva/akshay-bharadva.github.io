import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from "date-fns";

interface HabitCellProps {
  dateStr: string;
  isCompleted: boolean;
  color: string;
  onToggle: () => void;
  isToday: boolean;
}

// Custom comparison function for React.memo to ensure strict equality check
const arePropsEqual = (prev: HabitCellProps, next: HabitCellProps) => {
  return (
    prev.isCompleted === next.isCompleted &&
    prev.color === next.color &&
    prev.dateStr === next.dateStr &&
    prev.isToday === next.isToday
  );
};

const HabitCell = React.memo(
  ({ dateStr, isCompleted, color, onToggle, isToday }: HabitCellProps) => {
    const dateLabel = format(new Date(dateStr), "MMM do");

    return (
      <div className="flex items-center justify-center h-14 w-full relative">
        {isToday && (
          <div className="absolute inset-y-1 inset-x-0.5 bg-primary/5 rounded-md -z-10" />
        )}

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={onToggle}
                aria-label={`Mark ${dateLabel} as ${isCompleted ? "incomplete" : "complete"}`}
                className={cn(
                  "size-8 rounded-[8px] flex items-center justify-center transition-all duration-200 border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isCompleted
                    ? "border-transparent text-white shadow-sm"
                    : "bg-transparent border-border/40 hover:border-primary/30 hover:bg-secondary/50",
                )}
                style={{
                  backgroundColor: isCompleted ? color : undefined,
                  boxShadow: isCompleted
                    ? `0 2px 8px -2px ${color}60`
                    : undefined,
                }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCompleted ? 1 : 0,
                    opacity: isCompleted ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="size-4 stroke-[3.5px]" />
                </motion.div>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-3 max-w-[200px]">
              <div className="space-y-1">
                <p className="font-bold text-sm">{dateLabel}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      isCompleted ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  {isCompleted ? "Completed" : "Pending"}
                </div>
                {/* Hypothetical Streak Context */}
                {isCompleted && (
                  <p className="text-[10px] opacity-70 border-t border-border/50 pt-1 mt-1">
                    Marked done {formatDistanceToNow(new Date(dateStr))} ago
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  },
  arePropsEqual,
);

HabitCell.displayName = "HabitCell";
export default HabitCell;
