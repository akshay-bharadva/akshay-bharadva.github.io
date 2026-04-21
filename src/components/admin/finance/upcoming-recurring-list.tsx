import React, { useMemo } from "react";
import {
  format,
  addDays,
  subMonths,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { RecurringTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import {
  getFirstOccurrence,
  getNextOccurrence,
} from "@/lib/finance-utils";

export interface UpcomingRecurringListProps {
  recurring: RecurringTransaction[];
  onConfirm: (rule: RecurringTransaction, date: Date) => void;
}

type UpcomingItem = {
  rule: RecurringTransaction;
  date: Date;
  status: "overdue" | "due" | "upcoming";
};

export default function UpcomingRecurringList({
  recurring,
  onConfirm,
}: UpcomingRecurringListProps) {
  const upcomingItems = useMemo(() => {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const lookAhead = addDays(today, 45);
    const lookBehind = subMonths(today, 12);
    const items: UpcomingItem[] = [];

    recurring.forEach((rule) => {
      // ── Determine the first date to show ──────────────────────────
      // If we've already processed some occurrences, start from the
      // next one after the last processed date.
      // If we haven't processed any, compute the FIRST valid occurrence
      // from the rule's start_date (respecting occurrence_day).
      let nextDate: Date;

      if (rule.last_processed_date) {
        // getNextOccurrence returns strictly after the cursor
        nextDate = getNextOccurrence(
          parseLocalDate(rule.last_processed_date),
          rule,
        );
      } else {
        // getFirstOccurrence returns the first valid date ON or AFTER start_date
        // that matches the occurrence_day constraint.
        // e.g. start_date=Wednesday + occurrence_day=Friday(5) → returns Friday
        nextDate = getFirstOccurrence(parseLocalDate(rule.start_date), rule);
      }

      // ── Check end_date: skip rules that have already ended ────────
      if (
        rule.end_date &&
        isAfter(nextDate, parseLocalDate(rule.end_date))
      ) {
        return; // rule has ended, no more occurrences
      }

      // ── Generate occurrences within the look window ───────────────
      let safety = 0;
      while (isBefore(nextDate, lookAhead) && safety < 50) {
        // Respect end_date for each generated occurrence
        if (
          rule.end_date &&
          isAfter(nextDate, parseLocalDate(rule.end_date))
        ) {
          break;
        }

        if (isAfter(nextDate, lookBehind)) {
          let status: "overdue" | "due" | "upcoming" = "upcoming";
          if (isBefore(nextDate, startOfToday)) status = "overdue";
          else if (isSameDay(nextDate, startOfToday)) status = "due";

          items.push({ rule, date: new Date(nextDate), status });
        }

        nextDate = getNextOccurrence(nextDate, rule);
        safety++;
      }
    });

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recurring]);

  if (upcomingItems.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed bg-muted/20">
        <CalendarIcon className="mb-3 size-10 opacity-20" />
        <p className="text-sm">No upcoming recurring payments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingItems.map(({ rule, date, status }, index) => (
        <div
          key={`${rule.id}-${date.toISOString()}-${index}`}
          className={cn(
            "flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-secondary/40",
            status === "overdue" && "border-destructive/30 bg-destructive/5",
            status === "due" && "border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                rule.type === "earning"
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20",
              )}
            >
              {rule.type === "earning" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium leading-tight">
                {rule.description}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-medium",
                    status === "overdue" && "text-destructive",
                    status === "due" && "text-primary",
                  )}
                >
                  {status === "overdue"
                    ? "Overdue "
                    : status === "due"
                      ? "Due Today "
                      : format(date, "MMM d")}
                </span>
                <span className="hidden xs:inline">•</span>
                <span className="hidden xs:inline capitalize">
                  {rule.frequency}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold">
              ${rule.amount.toFixed(2)}
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant={status === "overdue" ? "destructive" : "outline"}
                  className="h-8 w-8 rounded-full p-0 shrink-0"
                >
                  <Check className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Log transaction for <strong>{rule.description}</strong> on{" "}
                    <strong>{format(date, "MMM do")}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onConfirm(rule, date)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}