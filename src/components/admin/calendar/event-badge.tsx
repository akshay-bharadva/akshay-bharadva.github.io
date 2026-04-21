import React from "react";
import {
  Briefcase,
  ListTodo,
  Banknote,
  TrendingUp,
  CheckSquare,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventType, ViewEventState } from "./types";

export interface EventBadgeProps {
  event: EventType;
  onViewEvent: (state: ViewEventState) => void;
}

export default function EventBadge({ event, onViewEvent }: EventBadgeProps) {
  let containerClass = "";
  let Icon = CalendarIcon;

  if (event.type === "event") {
    Icon = Briefcase;
    containerClass = "bg-primary/10 border-l-2 border-primary text-primary";
  } else if (event.type === "task") {
    Icon = ListTodo;
    if (event.priority === "high") {
      containerClass =
        "bg-destructive/10 border-l-2 border-destructive text-destructive-foreground dark:text-destructive";
    } else if (event.priority === "medium") {
      containerClass =
        "bg-yellow-500/10 border-l-2 border-yellow-500 text-yellow-600 dark:text-yellow-400";
    } else {
      containerClass =
        "bg-muted/50 border-l-2 border-muted-foreground text-muted-foreground";
    }
  } else if (event.type === "forecast" || event.type === "transaction") {
    Icon = event.type === "forecast" ? TrendingUp : Banknote;
    const isEarning = event.transactionType === "earning";
    containerClass = isEarning
      ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-600"
      : "bg-rose-500/10 border-l-2 border-rose-500 text-rose-600";

    if (event.type === "forecast")
      containerClass += " opacity-70 border-dashed";
  } else if (event.type === "transaction_summary") {
    Icon = Banknote;
    containerClass = "bg-card/40 border-l-2 border-border/20";
  } else if (event.type === "habit_summary") {
    Icon = CheckSquare;
    containerClass = "bg-secondary/30 border-l-2 border-border/30";
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 w-full overflow-hidden px-1.5 py-0.5 text-[10px] leading-tight h-full rounded-sm shadow-sm transition-all hover:brightness-95 cursor-pointer",
        containerClass
      )}
      onClick={() => {
        onViewEvent({
          open: true,
          event: event,
        });
      }}
    >
      <Icon className="size-3 shrink-0 opacity-80" />
      <span className="truncate flex-grow font-semibold">{event.title}</span>

      {(event.type === "transaction" || event.type === "forecast") &&
        event.amount && (
          <span className="font-mono font-bold whitespace-nowrap opacity-90 flex items-center gap-0.5">
            {event.transactionType === "earning" ? (
              <ArrowUpRight className="size-2.5" />
            ) : (
              <ArrowDownLeft className="size-2.5" />
            )}
            ${Math.round(event.amount)}
          </span>
        )}

      {event.type === "transaction_summary" && (
        <div className="flex gap-1.5 items-center font-mono text-[9px] font-bold">
          {event.total_earning && event.total_earning > 0 && (
            <span className="flex items-center text-emerald-500">
              <ArrowUpRight className="size-3 mr-0.5" />
              {Math.round(event.total_earning)}
            </span>
          )}
          {event.total_expense && event.total_expense > 0 && (
            <span className="flex items-center text-rose-500">
              <ArrowDownLeft className="size-3 mr-0.5" />
              {Math.round(event.total_expense)}
            </span>
          )}
        </div>
      )}

      {event.type === "habit_summary" && event.completed_habits && (
        <div className="flex -space-x-1">
          {event.completed_habits.slice(0, 3).map((h, i) => (
            <div
              key={i}
              className="size-2.5 rounded-full border border-background"
              style={{ backgroundColor: h.color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
