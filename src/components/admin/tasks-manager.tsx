import React, { useState, useMemo } from "react";
import type { Task } from "@/types";
import {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
} from "@/store/api/adminApi";
import { TaskTreeView } from "@/components/admin/tasks/TaskTreeView";
import { TaskKanbanBoard } from "@/components/admin/tasks/TaskKanbanBoard";
import TaskForm from "@/components/admin/tasks/TaskForm";
import { PageHeader, ManagerWrapper } from "@/components/admin/shared";
import { Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TaskManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskDefaults, setNewTaskDefaults] = useState<Partial<Task> | null>(
    null,
  );

  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [activeParentTaskId, setActiveParentTaskId] = useState<string | null>(
    null,
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // API Hooks
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addSubTask] = useAddSubTaskMutation();
  const [updateSubTask] = useUpdateSubTaskMutation();
  const [deleteSubTask] = useDeleteSubTaskMutation();

  // Derived state for editing
  const editingTask = useMemo(() => {
    if (editingTaskId) {
      return tasks.find((t) => t.id === editingTaskId) || null;
    }
    return newTaskDefaults || null;
  }, [tasks, editingTaskId, newTaskDefaults]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [tasks, searchTerm]);

  // Handlers
  const handleCreateTask = (initialStatus: "todo" | "inprogress" | "done" = "todo") => {
    setEditingTaskId(null);
    setNewTaskDefaults({ status: initialStatus });
    setIsSheetOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskDefaults(null);
    setIsSheetOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    const ok = await confirm({
      title: "Delete Task?",
      description: "This will permanently remove the task and all subtasks.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted");
      if (editingTaskId === id) setIsSheetOpen(false);
    } catch (err) {
      toast.error("Failed to delete task", { description: getErrorMessage(err) });
    }
  };

  const openSubtaskDialog = (taskId: string) => {
    setActiveParentTaskId(taskId);
    setNewSubtaskTitle("");
    setIsSubtaskDialogOpen(true);
  };

  const handleCreateSubtask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeParentTaskId || !newSubtaskTitle.trim()) return;
    try {
      await addSubTask({
        task_id: activeParentTaskId,
        title: newSubtaskTitle,
        is_completed: false,
      }).unwrap();
      toast.success("Subtask added");
      setIsSubtaskDialogOpen(false);
    } catch (err) {
      toast.error("Failed to add subtask", { description: getErrorMessage(err) });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ManagerWrapper className="flex flex-col h-[calc(100vh-4rem)] md:h-auto">
      <PageHeader
        title="Tasks"
        description="Manage projects, track progress, and organize your workflow"
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Filter tasks..."
        actions={
          <Button
            onClick={() => handleCreateTask("todo")}
            size="sm"
            className="h-9 shadow-sm"
          >
            <Plus className="mr-2 size-4" /> New Task
          </Button>
        }
      />

      {/* 
        MAIN CONTENT AREA 
        flex-1 min-h-0: Ensures it fills available space but scrolls internally
        overflow-hidden: Prevents double scrollbars
      */}
      <div className={cn("flex-1 min-h-0 flex flex-col bg-secondary/5 rounded-lg border border-border/40 relative mt-4", isMobile ? "overflow-hidden" : "overflow-visible")}>
        {isMobile ? (
          // MOBILE VIEW: TABLE / TREE
          <div className="h-full w-full overflow-auto bg-background">
            <TaskTreeView
              tasks={filteredTasks}
              onUpdateTask={(id, updates) => updateTask({ id, ...updates })}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddSubTask={openSubtaskDialog}
              onUpdateSubTask={(id, completed) =>
                updateSubTask({ id, is_completed: completed })
              }
              onDeleteSubTask={(id) => deleteSubTask(id)}
            />
          </div>
        ) : (
          // DESKTOP VIEW: KANBAN BOARD
          <div className="h-full w-full p-2">
            <TaskKanbanBoard
              tasks={filteredTasks}
              onUpdateTask={(id, updates) => updateTask({ id, ...updates })}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onNewTask={handleCreateTask}
            />
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <SheetHeader>
              <SheetTitle>
                {editingTask?.id ? "Edit Task" : "Create Task"}
              </SheetTitle>
              <SheetDescription>
                Manage task details and subtasks.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>

          <TaskForm
            key={editingTask?.id || "new"}
            task={editingTask}
            onSuccess={() => setIsSheetOpen(false)}
            onClose={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>Quickly add a sub-item.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubtask} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask-title">Title</Label>
              <Input
                id="subtask-title"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ManagerWrapper>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}