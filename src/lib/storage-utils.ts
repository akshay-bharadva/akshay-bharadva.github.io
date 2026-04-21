// Utilities for storage operations

import { supabase } from "@/supabase/client";
import { BUCKET_NAME } from "./constants";

/**
 * Get the public URL for a file stored in Supabase Storage.
 * Handles various input cases:
 * - null/undefined: returns empty string
 * - Already a full URL: returns as-is
 * - File path: constructs Supabase storage URL
 *
 * @param filePath - The file path or URL
 * @returns The public URL for the file
 */
export function getStorageUrl(filePath: string | null | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  if (!supabase) return filePath;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}
