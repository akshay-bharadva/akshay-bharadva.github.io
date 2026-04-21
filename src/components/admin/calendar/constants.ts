import {
  Briefcase,
  ListTodo,
  Banknote,
  TrendingUp,
  CheckSquare,
} from "lucide-react";
import type { EventType } from "./types";

// Google Calendar-style color palette for event types
export const EVENT_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  event: { bg: "#039be5", border: "#039be5", text: "#ffffff" },
  "task-high": { bg: "#d50000", border: "#d50000", text: "#ffffff" },
  "task-medium": { bg: "#f6bf26", border: "#f6bf26", text: "#1a1a1a" },
  "task-low": { bg: "#7986cb", border: "#7986cb", text: "#ffffff" },
  earning: { bg: "#33b679", border: "#33b679", text: "#ffffff" },
  expense: { bg: "#e67c73", border: "#e67c73", text: "#ffffff" },
  transaction_summary: { bg: "#616161", border: "#616161", text: "#ffffff" },
  habit_summary: { bg: "#8e24aa", border: "#8e24aa", text: "#ffffff" },
};

export function getEventColor(e: EventType) {
  if (e.type === "task") return EVENT_COLORS[`task-${e.priority || "low"}`];
  if (e.type === "transaction" || e.type === "forecast")
    return EVENT_COLORS[e.transactionType === "earning" ? "earning" : "expense"];
  return EVENT_COLORS[e.type] || EVENT_COLORS.event;
}

export function toFcEvent(e: EventType) {
  const color = getEventColor(e);
  // FullCalendar uses exclusive end dates for all-day events,
  // but we store inclusive end dates — so add 1 day for display
  let fcEnd = e.end;
  if (e.allDay && e.end) {
    fcEnd = new Date(e.end);
    fcEnd.setDate(fcEnd.getDate() + 1);
  }
  return {
    id: e.id,
    title: e.title,
    start: e.start,
    end: fcEnd,
    allDay: e.allDay,
    backgroundColor: color.bg,
    borderColor: color.border,
    textColor: color.text,
    classNames: [
      `gcal-event-${e.type}`,
      ...(e.type === "forecast" ? ["gcal-event-forecast"] : []),
    ],
    extendedProps: { originalEvent: e },
  };
}

export const FILTER_ITEMS = [
  { key: "event", label: "Events", color: EVENT_COLORS.event.bg, icon: Briefcase },
  { key: "task", label: "Tasks", color: EVENT_COLORS["task-high"].bg, icon: ListTodo },
  { key: "habit_summary", label: "Habits", color: EVENT_COLORS.habit_summary.bg, icon: CheckSquare },
  { key: "transaction_summary", label: "Finance", color: EVENT_COLORS.earning.bg, icon: Banknote },
  { key: "forecast", label: "Forecast", color: "#9e69af", icon: TrendingUp },
];

export const VIEW_OPTIONS = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
  { key: "listWeek", label: "Schedule" },
] as const;
