// Shared hook for standardized CRUD operations with confirmation and toast notifications

import { useCallback } from "react";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { toast } from "sonner";

interface UseCrudHandlersOptions<T> {
  /** Display name for the entity (e.g., "Task", "Note") */
  entityName: string;
  /** RTK Query delete mutation hook result */
  deleteMutation: readonly [
    (id: string) => { unwrap: () => Promise<unknown> },
    { isLoading: boolean }
  ];
  /** Optional callback after successful deletion */
  onDeleteSuccess?: () => void;
}

interface UseCrudHandlersReturn {
  /** Handle delete with confirmation dialog */
  handleDelete: (id: string, itemName?: string) => Promise<boolean>;
  /** Whether a delete operation is in progress */
  isDeleting: boolean;
}

/**
 * Hook for standardized CRUD handlers with confirmation dialogs and toast notifications.
 * Replaces duplicated delete handler patterns across manager components.
 *
 * @param options - Configuration options
 * @returns CRUD handler functions and loading states
 *
 * @example
 * ```tsx
 * const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
 *
 * const { handleDelete } = useCrudHandlers({
 *   entityName: "Note",
 *   deleteMutation: [deleteNote, { isLoading: isDeleting }],
 *   onDeleteSuccess: () => setSelectedNote(null),
 * });
 *
 * // Usage
 * <Button onClick={() => handleDelete(note.id, note.title)}>Delete</Button>
 * ```
 */
export function useCrudHandlers<T extends { id: string }>({
  entityName,
  deleteMutation,
  onDeleteSuccess,
}: UseCrudHandlersOptions<T>): UseCrudHandlersReturn {
  const confirm = useConfirm();
  const [deleteEntity, { isLoading: isDeleting }] = deleteMutation;

  const handleDelete = useCallback(
    async (id: string, itemName?: string): Promise<boolean> => {
      const confirmed = await confirm({
        title: `Delete ${entityName}?`,
        description: itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${entityName.toLowerCase()}? This action cannot be undone.`,
        variant: "destructive",
      });

      if (!confirmed) return false;

      try {
        await deleteEntity(id).unwrap();
        toast.success(`${entityName} deleted successfully`);
        onDeleteSuccess?.();
        return true;
      } catch (error: unknown) {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "An error occurred";
        toast.error(`Failed to delete ${entityName.toLowerCase()}`, {
          description: message,
        });
        return false;
      }
    },
    [confirm, deleteEntity, entityName, onDeleteSuccess]
  );

  return {
    handleDelete,
    isDeleting,
  };
}
