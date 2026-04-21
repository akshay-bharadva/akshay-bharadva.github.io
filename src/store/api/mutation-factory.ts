// TODO: Refactor adminApi.ts to use these factory functions and eliminate 300+ lines of duplication

import { supabase } from "@/supabase/client";
import type { ApiError } from "@/types";

// RTK Query's EndpointBuilder type is complex and deeply generic.
// Using a structural type keeps the factory type-safe at boundaries
// without coupling to RTK internals.
type EndpointBuilder = { mutation: (config: any) => any; query: (config: any) => any };

/** Base interface for entities with optional id */
interface BaseEntity {
  id?: string;
}

/** Options for creating a save mutation */
interface SaveMutationOptions {
  tableName: string;
  invalidateTags: string[];
}

/** Options for creating a delete mutation */
interface DeleteMutationOptions {
  tableName: string;
  invalidateTags: string[];
}

/**
 * Creates a standardized "save" (upsert) mutation for RTK Query.
 * Handles both insert and update operations based on presence of id.
 *
 * This replaces the 9+ duplicate "save" mutations:
 * - saveTransaction, saveRecurring, saveGoal
 * - saveSubject, saveTopic, saveNavLink
 * - saveSection, savePortfolioItem, saveHabit
 *
 * @param builder - RTK Query endpoint builder
 * @param options - Configuration for the mutation
 * @returns Configured mutation endpoint
 *
 * @example
 * ```typescript
 * saveTransaction: createSaveMutation<Transaction>(builder, {
 *   tableName: "transactions",
 *   invalidateTags: ["Transactions", "Calendar"],
 * }),
 * ```
 */
export function createSaveMutation<T extends BaseEntity>(
  builder: EndpointBuilder,
  options: SaveMutationOptions
) {
  const { tableName, invalidateTags } = options;

  return builder.mutation({
    queryFn: async (entity: Partial<T>) => {
      if (!supabase) return { error: { message: "No DB" } as ApiError };

      const { id, ...updateData } = entity;
      const promise = id
        ? supabase.from(tableName).update(updateData).eq("id", id)
        : supabase.from(tableName).insert(updateData);

      const { data, error } = await promise.select().single();
      if (error) return { error };
      return { data: data as T };
    },
    invalidatesTags: invalidateTags,
  });
}

/**
 * Creates a standardized "delete" mutation for RTK Query.
 * Returns consistent { id: string } response type.
 *
 * @param builder - RTK Query endpoint builder
 * @param options - Configuration for the mutation
 * @returns Configured mutation endpoint
 *
 * @example
 * ```typescript
 * deleteTransaction: createDeleteMutation(builder, {
 *   tableName: "transactions",
 *   invalidateTags: ["Transactions", "Calendar"],
 * }),
 * ```
 */
export function createDeleteMutation(
  builder: EndpointBuilder,
  options: DeleteMutationOptions
) {
  const { tableName, invalidateTags } = options;

  return builder.mutation({
    queryFn: async (id: string) => {
      if (!supabase) return { error: { message: "No DB" } as ApiError };

      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) return { error };
      return { data: { id } };
    },
    invalidatesTags: invalidateTags,
  });
}

/**
 * Creates a standardized query for fetching a single entity by id.
 *
 * @param builder - RTK Query endpoint builder
 * @param options - Configuration for the query
 * @returns Configured query endpoint
 */
export function createGetByIdQuery<T>(
  builder: EndpointBuilder,
  options: { tableName: string; providesTags: string[] }
) {
  const { tableName, providesTags } = options;

  return builder.query({
    queryFn: async (id: string) => {
      if (!supabase) return { error: { message: "No DB" } as ApiError };

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) return { error };
      return { data: data as T };
    },
    providesTags: providesTags,
  });
}

/**
 * Creates a standardized query for fetching all entities from a table.
 *
 * @param builder - RTK Query endpoint builder
 * @param options - Configuration for the query
 * @returns Configured query endpoint
 */
export function createGetAllQuery<T>(
  builder: EndpointBuilder,
  options: {
    tableName: string;
    providesTags: string[];
    orderBy?: { column: string; ascending?: boolean };
  }
) {
  const { tableName, providesTags, orderBy } = options;

  return builder.query({
    queryFn: async () => {
      if (!supabase) return { error: { message: "No DB" } as ApiError };

      let query = supabase.from(tableName).select("*");
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true,
        });
      }

      const { data, error } = await query;
      if (error) return { error };
      return { data: data as T[] };
    },
    providesTags: providesTags,
  });
}

/**
 * Standardized error handler for API calls.
 * Ensures consistent error structure across all endpoints.
 *
 * @param error - Unknown error from try-catch
 * @returns Standardized ApiError object
 */
export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as { message: string }).message,
      code: (error as { code?: string }).code,
    };
  }
  return { message: "An unexpected error occurred" };
}

/**
 * No database error constant for consistent messaging.
 */
export const NO_DB_ERROR: ApiError = { message: "No DB" };
