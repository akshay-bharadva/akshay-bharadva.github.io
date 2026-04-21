import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SignalHigh, SignalMedium, SignalLow, type LucideIcon } from "lucide-react";

type Priority = "low" | "medium" | "high";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; icon: LucideIcon }
> = {
  low: {
    label: "Low",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: SignalLow,
  },
  medium: {
    label: "Medium",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: SignalMedium,
  },
  high: {
    label: "High",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: SignalHigh,
  },
};

export function TaskPriorityPill({
  priority,
  onChange,
}: {
  priority: Priority;
  onChange: (p: Priority) => void;
}) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["medium"];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center size-8 rounded-full transition-all hover:scale-110",
            config.color,
          )}
          title={`Priority: ${config.label}`}
        >
          <Icon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => {
          const ItemIcon = conf.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key as Priority)}
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
