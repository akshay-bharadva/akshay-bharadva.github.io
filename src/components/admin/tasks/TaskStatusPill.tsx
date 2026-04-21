import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, type LucideIcon } from "lucide-react";

type Status = "todo" | "inprogress" | "done";

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; icon: LucideIcon }
> = {
  todo: {
    label: "To Do",
    color:
      "bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25",
    icon: Circle,
  },
  inprogress: {
    label: "In Progress",
    color:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25",
    icon: Clock,
  },
  done: {
    label: "Done",
    color:
      "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25",
    icon: CheckCircle2,
  },
};

export function TaskStatusPill({
  status,
  onChange,
}: {
  status: Status;
  onChange: (s: Status) => void;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["todo"];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center w-full justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border border-transparent",
            config.color,
          )}
        >
          <Icon className="size-3.5" />
          {config.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[140px]">
        {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
          const ItemIcon = conf.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key as Status)}
              className="gap-2"
            >
              <ItemIcon className="size-4 opacity-70" />
              {conf.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
