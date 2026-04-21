import { Habit } from "@/types";
import { subDays, format, differenceInCalendarDays, parseISO } from "date-fns";
import {
  HABIT_WINDOW_DAYS,
  STREAK_ALIVE_THRESHOLD_DAYS,
} from "./constants";

export function calculateHabitStats(habit: Habit): {
  streak: number;
  completionRate: number;
} {
  const logs = habit.habit_logs || [];
  if (logs.length === 0) return { streak: 0, completionRate: 0 };

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Completion rate over the rolling window
  const windowStartStr = format(
    subDays(today, HABIT_WINDOW_DAYS - 1),
    "yyyy-MM-dd"
  );

  const logsInWindow = logs.filter(
    (l) => l.completed_date >= windowStartStr && l.completed_date <= todayStr
  ).length;

  const completionRate = Math.min(
    Math.round((logsInWindow / HABIT_WINDOW_DAYS) * 100),
    100
  );

  // Streak: count consecutive days from most recent log backward
  const sortedLogs = [...logs].sort((a, b) =>
    b.completed_date.localeCompare(a.completed_date)
  );

  let streak = 0;
  const lastLogDate = parseISO(sortedLogs[0].completed_date);
  const diffFromToday = differenceInCalendarDays(today, lastLogDate);

  if (diffFromToday <= STREAK_ALIVE_THRESHOLD_DAYS) {
    streak = 1;
    for (let i = 1; i < sortedLogs.length; i++) {
      const current = parseISO(sortedLogs[i - 1].completed_date);
      const prev = parseISO(sortedLogs[i].completed_date);
      const diff = differenceInCalendarDays(current, prev);

      if (diff === 1) {
        streak++;
      } else if (diff === 0) {
        continue; // duplicate log for same day
      } else {
        break;
      }
    }
  }

  return { streak, completionRate };
}
