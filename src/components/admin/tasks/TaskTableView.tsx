import { Task } from "@/types";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  Trash2,
  Edit,
  CheckSquare,
} from "lucide-react";
import { TaskStatusPill } from "./TaskStatusPill";
import { TaskPriorityPill } from "./TaskPriorityPill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { parseLocalDate } from "@/lib/utils";

interface TableViewProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskTableView({
  tasks,
  onUpdate,
  onEdit,
  onDelete,
}: TableViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
        <CheckSquare className="mb-2 size-10 opacity-20" />
        <p>No tasks found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[40%] pl-6">Task</TableHead>
            <TableHead className="w-[150px]">Status</TableHead>
            <TableHead className="w-[120px]">Priority</TableHead>
            <TableHead className="w-[150px]">Due Date</TableHead>
            <TableHead className="w-[100px] text-center">Subtasks</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const subtaskCount = task.sub_tasks?.length || 0;
            const completedCount =
              task.sub_tasks?.filter((s) => s.is_completed).length || 0;

            return (
              <TableRow
                key={task.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6 font-medium">
                  <span
                    onClick={() => onEdit(task)}
                    className="cursor-pointer hover:text-primary transition-colors hover:underline underline-offset-4"
                  >
                    {task.title}
                  </span>
                </TableCell>
                <TableCell>
                  <TaskStatusPill
                    status={task.status || "todo"}
                    onChange={(s) => onUpdate(task.id, { status: s })}
                  />
                </TableCell>
                <TableCell>
                  <TaskPriorityPill
                    priority={task.priority || "medium"}
                    onChange={(p) => onUpdate(task.id, { priority: p })}
                  />
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 size-3.5 opacity-70" />
                      {format(parseLocalDate(task.due_date), "MMM d, yyyy")}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">
                      No due date
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {subtaskCount > 0 ? (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {completedCount}/{subtaskCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/30 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="mr-2 size-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(task.id)}
                      >
                        <Trash2 className="mr-2 size-4" /> Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}