// Shared hook for search and filter functionality across manager components

import { useMemo, useState, useCallback } from "react";

interface UseSearchFilterOptions<T> {
  /** The data array to search/filter */
  data: T[];
  /** Fields to search in (must be string fields on T) */
  searchFields: (keyof T)[];
  /** Initial search term */
  initialSearch?: string;
}

interface UseSearchFilterReturn<T> {
  /** Current search term */
  searchTerm: string;
  /** Update the search term */
  setSearchTerm: (term: string) => void;
  /** Clear the search term */
  clearSearch: () => void;
  /** Filtered data based on search term */
  filteredData: T[];
  /** Whether the search has results */
  hasResults: boolean;
  /** Whether search is active (has non-empty term) */
  isSearching: boolean;
}

/**
 * Hook for implementing search functionality across data arrays.
 * Replaces duplicated search/filter logic in manager components like:
 * - blog-manager.tsx
 * - tasks-manager.tsx
 * - notes-manager.tsx
 *
 * @param options - Configuration options
 * @returns Search state and filtered data
 *
 * @example
 * ```tsx
 * const { searchTerm, setSearchTerm, filteredData } = useSearchFilter({
 *   data: posts,
 *   searchFields: ['title', 'content', 'excerpt'],
 * });
 *
 * return (
 *   <>
 *     <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
 *     {filteredData.map(post => <PostCard key={post.id} post={post} />)}
 *   </>
 * );
 * ```
 */
export function useSearchFilter<T>({
  data,
  searchFields,
  initialSearch = "",
}: UseSearchFilterOptions<T>): UseSearchFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return (
          typeof value === "string" && value.toLowerCase().includes(lowerSearch)
        );
      })
    );
  }, [data, searchTerm, searchFields]);

  const isSearching = searchTerm.trim().length > 0;
  const hasResults = filteredData.length > 0;

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredData,
    hasResults,
    isSearching,
  };
}
