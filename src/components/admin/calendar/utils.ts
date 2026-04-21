import { parseLocalDate } from "@/lib/utils";
import type { CalendarItem, EventType } from "./types";

export const mapItemToEvent = (item: CalendarItem): EventType => {
  const { type: transactionType, ...restOfData } = item.data;

  let startDate: Date;

  if (
    item.item_type === "task" ||
    item.item_type === "transaction" ||
    item.item_type === "transaction_summary"
  ) {
    startDate = parseLocalDate(item.start_time);
  } else {
    startDate = new Date(item.start_time);
  }

  return {
    id: item.item_id,
    title: item.title,
    start: startDate,
    end: item.end_time ? new Date(item.end_time) : undefined,
    allDay:
      item.item_type === "task" ||
      item.item_type === "transaction" ||
      item.item_type === "habit_summary" ||
      item.item_type === "transaction_summary" ||
      Boolean(item.data.is_all_day),
    type: item.item_type,
    transactionType: transactionType as string | undefined,
    ...restOfData,
  };
};

export const getDaysInMonth = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

export const getEventsForDate = (events: EventType[], date: Date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === date.toDateString();
  });
};
