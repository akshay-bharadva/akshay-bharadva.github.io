import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit,
  Trash2,
  CheckSquare,
  ListTodo,
  Banknote,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BadgeTypeIcon from "./badge-type-icon";
import type { EventType } from "./types";

export interface EventDetailsContentProps {
  event: EventType;
  onEdit: () => void;
  onNavigate: (tab: string) => void;
  onDelete?: () => void;
}

export default function EventDetailsContent({
  event,
  onEdit,
  onNavigate,
  onDelete,
}: EventDetailsContentProps) {
  const { type, transactionType, amount, status, priority, description } =
    event;
  const isEarning = transactionType === "earning";
  const amountColor = isEarning ? "text-emerald-500" : "text-rose-500";

  if (type === "habit_summary") {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" /> Daily Habits
          </h3>
          <Badge variant="outline">{event.count} Completed</Badge>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="flex flex-col gap-2">
            {event.completed_habits?.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full ring-2 ring-background shadow-sm"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="font-medium text-sm">{h.title}</span>
                </div>
                <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Plus className="size-3 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (type === "transaction_summary") {
    const { transactions, total_earning, total_expense } = event;

    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Banknote className="size-5 text-primary" /> Daily Finance
          </h3>
          <Badge variant="outline">{transactions?.length || 0} Records</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Income
            </span>
            <div className="text-emerald-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
              <ArrowUpRight className="size-5" />$
              {total_earning?.toLocaleString()}
            </div>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Expenses
            </span>
            <div className="text-rose-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
              <ArrowDownLeft className="size-5" />$
              {total_expense?.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">
          Breakdown
        </div>
        <ScrollArea className="h-[180px] pr-4">
          <div className="flex flex-col gap-2">
            {transactions?.map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2.5 rounded-lg border bg-card/40 text-sm"
              >
                <span className="truncate max-w-[180px] font-medium">
                  {t.description}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold flex items-center gap-1",
                    t.type === "earning" ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {t.type === "earning" ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownLeft className="size-3" />
                  )}
                  ${t.amount}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-2">
          <Button
            onClick={() => onNavigate("finance")}
            size="sm"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Manage in Finance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <BadgeTypeIcon type={type} />
          <span>{type}</span>
          <span>•</span>
          <span>{format(event.start, "MMM d, h:mm a")}</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-4 text-sm">
        {type === "event" && description && (
          <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground italic">
            "{description}"
          </div>
        )}

        {type === "task" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Status
              </span>
              <Badge variant={status === "done" ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Priority
              </span>
              <div className="flex items-center gap-2 font-medium">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    priority === "high"
                      ? "bg-destructive"
                      : priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  )}
                />
                <span className="capitalize">{priority}</span>
              </div>
            </div>
          </div>
        )}

        {(type === "transaction" || type === "forecast") && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-card border shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Amount
              </span>
              <div
                className={cn(
                  "font-mono text-2xl font-bold flex items-center gap-1",
                  amountColor
                )}
              >
                {isEarning ? (
                  <ArrowUpRight className="size-5" />
                ) : (
                  <ArrowDownLeft className="size-5" />
                )}
                ${amount?.toFixed(2)}
              </div>
            </div>
            <div
              className={cn(
                "p-2 rounded-full",
                isEarning ? "bg-emerald-500/10" : "bg-rose-500/10"
              )}
            >
              {isEarning ? (
                <ArrowDownLeft className={cn("size-6", amountColor)} />
              ) : (
                <ArrowUpRight className={cn("size-6", amountColor)} />
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        {type === "event" && (
          <>
            <Button variant="outline" onClick={onEdit} size="sm">
              <Edit className="mr-2 size-3.5" /> Edit
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} size="sm">
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </>
        )}
        {type === "task" && (
          <Button
            onClick={() => onNavigate("tasks")}
            size="sm"
            className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent shadow-none"
          >
            <ListTodo className="mr-2 size-3.5" /> Go to Board
          </Button>
        )}
        {type === "transaction" && (
          <Button
            onClick={() => onNavigate("finance")}
            size="sm"
            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent shadow-none"
          >
            <Banknote className="mr-2 size-3.5" /> View Finance
          </Button>
        )}
      </div>
    </div>
  );
}
