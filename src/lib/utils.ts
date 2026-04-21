// Core utilities - cn() for Tailwind class merging and slugify()

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Convert a string to a URL-friendly slug.
 *
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

// =============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================
// These functions have been moved to dedicated utility files but are re-exported
// here to maintain backward compatibility with existing imports.

export { getStorageUrl } from "./storage-utils";
export { parseLocalDate, formatDate } from "./date-utils";
export { hexToHsl } from "./color-utils";

const WORDS_PER_MINUTE = 225;

export function calculateReadTime(content: string = ""): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}
