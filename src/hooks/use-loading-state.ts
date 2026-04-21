// Shared hook for managing multiple loading states

import { useMemo } from "react";

/**
 * Combine multiple RTK Query loading states into a single boolean.
 * Useful when a component depends on multiple queries.
 *
 * @param loadingStates - Array of boolean loading states
 * @returns true if any state is loading
 *
 * @example
 * ```tsx
 * const { isLoading: isTasksLoading } = useGetTasksQuery();
 * const { isLoading: isEventsLoading } = useGetEventsQuery();
 *
 * const isLoading = useLoadingState([isTasksLoading, isEventsLoading]);
 *
 * if (isLoading) return <LoadingSpinner />;
 * ```
 */
export function useLoadingState(loadingStates: boolean[]): boolean {
  return useMemo(
    () => loadingStates.some((isLoading) => isLoading),
    [loadingStates]
  );
}

/**
 * Combine multiple RTK Query mutation loading states.
 * Useful when tracking multiple concurrent mutations.
 *
 * @param mutationStates - Array of mutation result objects with isLoading
 * @returns Combined loading state and individual states
 *
 * @example
 * ```tsx
 * const [addTask, addState] = useAddTaskMutation();
 * const [updateTask, updateState] = useUpdateTaskMutation();
 *
 * const { isAnyLoading, isAdding, isUpdating } = useMutationLoadingState({
 *   add: addState.isLoading,
 *   update: updateState.isLoading,
 * });
 *
 * <Button disabled={isAnyLoading}>
 *   {isAdding ? "Adding..." : isUpdating ? "Updating..." : "Save"}
 * </Button>
 * ```
 */
export function useMutationLoadingState<T extends Record<string, boolean>>(
  states: T
): { isAnyLoading: boolean } & T {
  const isAnyLoading = useMemo(
    () => Object.values(states).some(Boolean),
    [states]
  );

  return {
    isAnyLoading,
    ...states,
  } as { isAnyLoading: boolean } & T;
}
