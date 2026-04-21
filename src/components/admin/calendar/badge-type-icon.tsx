import React from "react";
import {
  Briefcase,
  ListTodo,
  Banknote,
  TrendingUp,
  CheckSquare,
  Calendar as CalendarIcon,
} from "lucide-react";

export interface BadgeTypeIconProps {
  type: string;
}

export default function BadgeTypeIcon({ type }: BadgeTypeIconProps) {
  switch (type) {
    case "event":
      return <Briefcase className="size-3" />;
    case "task":
      return <ListTodo className="size-3" />;
    case "transaction":
    case "transaction_summary":
      return <Banknote className="size-3" />;
    case "forecast":
      return <TrendingUp className="size-3" />;
    case "habit":
    case "habit_summary":
      return <CheckSquare className="size-3" />;
    default:
      return <CalendarIcon className="size-3" />;
  }
}
