import React, { useState, useRef } from "react";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  Plus,
  CheckSquare,
  Clock,
  Circle,
  Edit,
  Trash2,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, PanInfo } from "framer-motion";
import { cn, parseLocalDate } from "@/lib/utils";
import { format } from "date-fns";
import { TaskPriorityPill } from "./TaskPriorityPill";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppDispatch } from "@/store/hooks";
import { startFocus } from "@/store/slices/focusSlice";
import { toast } from "sonner";

// Type definition for the column configuration
type Column = {
  id: "todo" | "inprogress" | "done";
  label: string;
  icon: React.ElementType;
  color: string;
};

// Column definitions
const COLUMNS: Column[] = [
  {
    id: "todo",
    label: "To Do",
    icon: Circle,
    color:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  },
  {
    id: "inprogress",
    label: "In Progress",
    icon: Clock,
    color:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckSquare,
    color:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900",
  },
];

interface TaskKanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onNewTask: (status: "todo" | "inprogress" | "done") => void;
}

export function TaskKanbanBoard({
  tasks,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
  onNewTask,
}: TaskKanbanBoardProps) {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const columnRefs = {
    todo: useRef<HTMLDivElement>(null),
    inprogress: useRef<HTMLDivElement>(null),
    done: useRef<HTMLDivElement>(null),
  };

  const handleStartFocus = (task: Task) => {
    dispatch(
      startFocus({
        durationMinutes: 25,
        taskTitle: task.title,
        taskId: task.id,
      })
    );
    toast.success("Focus timer started for task");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;
        const isDragging = !!draggingTaskId;

        return (
          <div
            key={col.id}
            ref={columnRefs[col.id]}
            className={cn(
              "flex-1 min-w-[300px] flex flex-col rounded-xl bg-muted/20 border transition-all duration-300",
              isDragging
                ? "border-dashed border-primary/50"
                : "border-border/50",
              activeColumn === col.id ? "z-20" : "z-10",
            )}
          >
            {/* Column Header */}
            <div
              className={cn(
                "p-3 flex items-center justify-between border-b bg-background/50 rounded-t-xl",
                col.color,
              )}
            >
              <div className="flex items-center gap-2 font-semibold text-sm ">
                <Icon className="size-4" />
                {col.label}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-background/80 text-foreground font-mono text-[10px] h-5"
                >
                  {colTasks.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-background/80"
                onClick={() => onNewTask(col.id)}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Tasks Area */}
            <div className="flex-1 p-3 flex flex-col">
              <div className="flex flex-col gap-3 flex-1">
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                    onUpdateTask={onUpdateTask}
                    onFocus={() => handleStartFocus(task)}
                    onDragStart={() => {
                      setDraggingTaskId(task.id);
                      setActiveColumn(task.status as string);
                    }}
                    onDragEnd={(event, info) => {
                      const point = info.point;
                      Object.entries(columnRefs).forEach(([status, ref]) => {
                        if (ref.current) {
                          const rect = ref.current.getBoundingClientRect();
                          if (
                            point.x >= rect.left &&
                            point.x <= rect.right &&
                            point.y >= rect.top &&
                            point.y <= rect.bottom &&
                            task.status !== status
                          ) {
                            onUpdateTask(task.id, {
                              status: status as Task["status"],
                            });
                          }
                        }
                      });
                      setDraggingTaskId(null);
                      setActiveColumn(null);
                    }}
                    isDragging={draggingTaskId === task.id}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center flex-1 min-h-24 rounded-lg border-2 border-dashed border-muted-foreground/10 text-muted-foreground/50 transition-all text-sm font-medium">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  task,
  onEdit,
  onDelete,
  onUpdateTask,
  onFocus,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onFocus: () => void;
  onDragStart: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
  isDragging: boolean;
}) {
  const completedSubtasks =
    task.sub_tasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = task.sub_tasks?.length || 0;

  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 1.05,
        zIndex: 100,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      }}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <Card
        className="group relative hover:shadow-md transition-all duration-200 border-l-[3px]"
        style={{
          borderLeftColor:
            task.priority === "high"
              ? "#ef4444"
              : task.priority === "medium"
                ? "#f97316"
                : "#60a5fa",
        }}
      >
        <div className="absolute inset-0 z-0" />
        <CardContent className="p-3 space-y-3 relative z-10 pointer-events-none">
          <div className="flex justify-between items-start gap-2">
            <span className="font-medium text-sm leading-snug line-clamp-2 text-foreground/90">
              {task.title}
            </span>
            <div className="pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onFocus}>
                    <Zap className="mr-2 size-3.5 text-yellow-500" /> Start
                    Focus
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 size-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-2 size-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center justify-between pointer-events-auto">
            <div onClick={(e) => e.stopPropagation()}>
              <TaskPriorityPill
                priority={task.priority || "medium"}
                onChange={(p) => onUpdateTask(task.id, { priority: p })}
              />
            </div>
            {task.due_date && (
              <div className="flex items-center text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                <Calendar className="size-3 mr-1" />
                {format(parseLocalDate(task.due_date), "MMM d")}
              </div>
            )}
          </div>
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-secondary rounded-full">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
