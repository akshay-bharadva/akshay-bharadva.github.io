// Utilities for date parsing and formatting

import { parseISO, isValid } from "date-fns";

/**
 * Parse a date input into a local Date object.
 * Handles various input formats while avoiding timezone shifts.
 *
 * @param dateInput - Date string, Date object, or null/undefined
 * @returns A valid Date object (defaults to current date if invalid)
 */
export function parseLocalDate(
  dateInput: string | Date | null | undefined
): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  // Handle "YYYY-MM-DD" strings specifically to prevent timezone shifts.
  // new Date("2024-05-23") creates UTC midnight, which is 2024-05-22 20:00:00 EST.
  // We want 2024-05-23 00:00:00 Local.
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Handle standard ISO strings with time components
  const parsed = parseISO(dateInput);
  if (isValid(parsed)) return parsed;

  return new Date();
}

/**
 * Format a date for display using Intl.DateTimeFormat.
 *
 * @param dateInput - Date to format (Date, string, number, or null/undefined)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseLocalDate(dateInput?.toString());

  if (!isValid(date)) return "N/A";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return date.toLocaleDateString("en-US", defaultOptions);
}
