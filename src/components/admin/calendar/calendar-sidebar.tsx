import React from "react";
import { cn } from "@/lib/utils";
import { format, isAfter, isSameDay, startOfDay } from "date-fns";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { FILTER_ITEMS, getEventColor } from "./constants";
import type { EventType, ViewEventState } from "./types";

export interface CalendarSidebarProps {
  currentDate: Date;
  selectedDate: Date | undefined;
  filters: string[];
  events: EventType[];
  onMiniCalendarSelect: (date: Date | undefined) => void;
  onMiniCalendarMonthChange: (month: Date) => void;
  onToggleFilter: (key: string) => void;
  onViewEvent: (state: ViewEventState) => void;
}

export default function CalendarSidebar({
  currentDate,
  selectedDate,
  filters,
  events,
  onMiniCalendarSelect,
  onMiniCalendarMonthChange,
  onToggleFilter,
  onViewEvent,
}: CalendarSidebarProps) {
  const upcomingEvents = events
    .filter(
      (e) =>
        isAfter(e.start, startOfDay(new Date())) ||
        isSameDay(e.start, new Date())
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 8);

  return (
    <aside className="w-70 shrink-0 border-r border-border bg-card/30 hidden lg:flex flex-col overflow-hidden">
      {/* Mini Calendar — fixed at top */}
      <div className="pt-4 pb-2 shrink-0">
        <MiniCalendar
          mode="single"
          month={currentDate}
          selected={selectedDate}
          onSelect={onMiniCalendarSelect}
          onMonthChange={onMiniCalendarMonthChange}
          className="rounded-lg"
        />
      </div>

      {/* Filter checkboxes — fixed */}
      <div className="px-3 py-2 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Calendars
        </p>
        {FILTER_ITEMS.map((item) => {
          const active = filters.includes(item.key);
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onToggleFilter(item.key)}
              className={cn(
                "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
                "hover:bg-accent/50",
                active
                  ? "text-foreground"
                  : "text-muted-foreground opacity-60"
              )}
            >
              <div
                className={cn(
                  "size-3 rounded-sm border-2 transition-colors shrink-0",
                  active
                    ? "border-transparent"
                    : "border-muted-foreground/40 bg-transparent"
                )}
                style={
                  active
                    ? { backgroundColor: item.color, borderColor: item.color }
                    : undefined
                }
              />
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upcoming — takes remaining space, only this scrolls */}
      <div className="flex-1 min-h-0 px-3 py-2 flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 shrink-0">
          Upcoming
        </p>
        <div className="flex-1 overflow-y-auto space-y-1">
          {upcomingEvents.map((e) => {
            const color = getEventColor(e);
            return (
              <button
                key={e.id}
                onClick={() => onViewEvent({ open: true, event: e })}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs hover:bg-accent/50 transition-colors text-left"
              >
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {e.title}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {format(e.start, "MMM d, h:mm a")}
                  </p>
                </div>
              </button>
            );
          })}
          {upcomingEvents.length === 0 && (
            <p className="text-xs text-muted-foreground/60 px-2 py-2">
              No upcoming events
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
