// Utilities for financial calculations
import type { RecurringTransaction } from "@/types";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  setDate,
  startOfDay,
  getDay,
  getDate,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import {
  FREQUENCY,
  DAY_OF_WEEK_MIN,
  DAY_OF_WEEK_MAX,
  DAY_OF_MONTH_MIN,
  DAY_OF_MONTH_MAX,
} from "./constants";
import { parseLocalDate } from "./utils";

/** Day type for date-fns (0=Sun … 6=Sat) */
type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Given a date and a target day-of-week, return the NEXT occurrence of that
 * weekday strictly AFTER the given date. Never returns the same date.
 */
function nextWeekday(from: Date, targetDow: Day): Date {
  const currentDow = getDay(from);
  let diff = targetDow - currentDow;
  if (diff <= 0) diff += 7; // always move forward, never 0
  return addDays(from, diff);
}

/**
 * Given a date and a target day-of-week, return the occurrence of that weekday
 * on or after the given date. May return the same date if it already matches.
 */
function nextOrSameWeekday(from: Date, targetDow: Day): Date {
  const currentDow = getDay(from);
  if (currentDow === targetDow) return new Date(from);
  let diff = targetDow - currentDow;
  if (diff < 0) diff += 7;
  return addDays(from, diff);
}

/**
 * Given a date and a target day-of-month, return the next month date with that
 * day, strictly AFTER the given date. Clamps to end of month.
 */
function nextMonthDay(from: Date, targetDom: number): Date {
  const currentDom = getDate(from);
  if (currentDom < targetDom) {
    // Target day is later this month — try it
    const candidate = setDate(from, Math.min(targetDom, daysInMonth(from)));
    if (candidate > from) return candidate;
  }
  // Move to next month
  const next = addMonths(from, 1);
  return setDate(next, Math.min(targetDom, daysInMonth(next)));
}

/**
 * Given a date and a target day-of-month, return the occurrence on or after
 * the given date. May return the same date if it already matches.
 */
function nextOrSameMonthDay(from: Date, targetDom: number): Date {
  const currentDom = getDate(from);
  const clampedTarget = Math.min(targetDom, daysInMonth(from));
  if (currentDom === clampedTarget) return new Date(from);
  if (currentDom < clampedTarget) {
    return setDate(from, clampedTarget);
  }
  // Past the target day this month — go to next month
  const next = addMonths(from, 1);
  return setDate(next, Math.min(targetDom, daysInMonth(next)));
}

/** Get number of days in the month of a given date */
function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Get the FIRST occurrence date for a recurring rule, starting from its
 * start_date. This respects occurrence_day so the first generated date
 * always falls on the correct weekday / month-day.
 *
 * @param startDate - The rule's start_date as a Date
 * @param rule - The recurring transaction rule
 * @returns The first valid occurrence date (on or after start_date)
 */
export function getFirstOccurrence(
  startDate: Date,
  rule: RecurringTransaction,
): Date {
  const start = startOfDay(new Date(startDate));

  switch (rule.frequency) {
    case FREQUENCY.DAILY:
    case FREQUENCY.YEARLY:
      // First occurrence is always the start date itself
      return start;

    case FREQUENCY.WEEKLY:
    case FREQUENCY.BI_WEEKLY:
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= DAY_OF_WEEK_MIN &&
        rule.occurrence_day <= DAY_OF_WEEK_MAX
      ) {
        // Snap forward to the first matching weekday on or after start
        return nextOrSameWeekday(start, rule.occurrence_day as Day);
      }
      return start;

    case FREQUENCY.MONTHLY:
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= DAY_OF_MONTH_MIN &&
        rule.occurrence_day <= DAY_OF_MONTH_MAX
      ) {
        return nextOrSameMonthDay(start, rule.occurrence_day);
      }
      return start;

    default:
      return start;
  }
}

/**
 * Calculate the next occurrence date for a recurring transaction AFTER
 * the given cursor date. The returned date is always strictly after cursor.
 *
 * @param cursor - The current/last occurrence date to calculate from
 * @param rule - The recurring transaction rule
 * @returns The next occurrence date (strictly after cursor)
 */
export function getNextOccurrence(
  cursor: Date,
  rule: RecurringTransaction,
): Date {
  const current = startOfDay(new Date(cursor));

  switch (rule.frequency) {
    case FREQUENCY.DAILY:
      return addDays(current, 1);

    case FREQUENCY.WEEKLY:
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= DAY_OF_WEEK_MIN &&
        rule.occurrence_day <= DAY_OF_WEEK_MAX
      ) {
        // nextWeekday always returns strictly after current
        return nextWeekday(current, rule.occurrence_day as Day);
      }
      return addWeeks(current, 1);

    case FREQUENCY.BI_WEEKLY:
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= DAY_OF_WEEK_MIN &&
        rule.occurrence_day <= DAY_OF_WEEK_MAX
      ) {
        // Jump to the next matching weekday, then add 1 more week = 2 week gap
        // But we need to be smarter: from a Friday, nextWeekday gives next Friday (7 days),
        // then we add 7 more = 14 days. That's correct.
        // From a non-matching day, nextWeekday gives the next matching day (< 7 days),
        // then +7 could be < 14 days total. So we always base it on the current occurrence.
        // Since cursor should always be on the correct weekday (it's a past occurrence),
        // this simplifies to: add 14 days.
        return addDays(current, 14);
      }
      return addWeeks(current, 2);

    case FREQUENCY.MONTHLY:
      if (
        rule.occurrence_day != null &&
        rule.occurrence_day >= DAY_OF_MONTH_MIN &&
        rule.occurrence_day <= DAY_OF_MONTH_MAX
      ) {
        // Always move strictly forward to the next month with this day
        return nextMonthDay(current, rule.occurrence_day);
      }
      return addMonths(current, 1);

    case FREQUENCY.YEARLY:
      return addYears(current, 1);

    default:
      return addDays(current, 1);
  }
}

/**
 * A single projected occurrence of a recurring transaction rule.
 */
export type ProjectedOccurrence = {
  /** The recurring rule that generated this occurrence */
  rule: RecurringTransaction;
  /** The projected date of this occurrence */
  date: Date;
};

/**
 * Project all future occurrences of recurring transaction rules within a
 * date range. Each rule is iterated from its last processed date (or start
 * date) forward, producing one entry per projected occurrence.
 *
 * @param rules - Array of recurring transaction rules to project
 * @param startDate - Start of the projection window (inclusive)
 * @param endDate - End of the projection window (exclusive)
 * @param options.maxPerRule - Safety limit per rule to prevent infinite loops (default 1000)
 * @returns Array of projected occurrences sorted chronologically
 */
export function projectRecurringOccurrences(
  rules: RecurringTransaction[],
  startDate: Date,
  endDate: Date,
  options?: { maxPerRule?: number },
): ProjectedOccurrence[] {
  const maxPerRule = options?.maxPerRule ?? 1000;
  const occurrences: ProjectedOccurrence[] = [];

  rules.forEach((rule) => {
    // Determine the initial cursor: if previously processed, advance from
    // the last processed date; otherwise compute the first valid occurrence.
    let cursor: Date;
    if (rule.last_processed_date) {
      cursor = getNextOccurrence(
        parseLocalDate(rule.last_processed_date),
        rule,
      );
    } else {
      cursor = getFirstOccurrence(parseLocalDate(rule.start_date), rule);
    }

    // Fast-forward past the start of the window
    let safety = 0;
    while (isBefore(cursor, startDate) && !isSameDay(cursor, startDate) && safety < maxPerRule) {
      cursor = getNextOccurrence(cursor, rule);
      safety++;
    }

    // Generate occurrences within the window
    safety = 0;
    while (isBefore(cursor, endDate) && safety < maxPerRule) {
      // Respect the rule's own end date
      const ruleEndDate = rule.end_date
        ? parseLocalDate(rule.end_date)
        : null;
      if (ruleEndDate && isAfter(cursor, ruleEndDate)) break;

      // Only include dates on or after the window start
      if (isAfter(cursor, startDate) || isSameDay(cursor, startDate)) {
        occurrences.push({
          rule,
          date: new Date(cursor),
        });
      }

      cursor = getNextOccurrence(cursor, rule);
      safety++;
    }
  });

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
}