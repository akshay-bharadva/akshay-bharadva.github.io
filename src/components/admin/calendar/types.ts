export type CalendarItem = {
  item_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  item_type:
    | "event"
    | "task"
    | "transaction"
    | "habit_summary"
    | "transaction_summary";
  data: Record<string, unknown>;
};

export type EventType = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  type: string;
  transactionType?: string;
  amount?: number;
  priority?: string;
  status?: string;
  description?: string;
  count?: number;
  completed_habits?: Array<{ title: string; color: string }>;
  total_earning?: number;
  total_expense?: number;
  transactions?: { id: string; description: string; amount: number; type: string }[];
};

export type EventFormData = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
};

export type SheetState = {
  open: boolean;
  isNew: boolean;
};

export type ViewEventState = {
  open: boolean;
  event: EventType | null;
};

export type DayListState = {
  open: boolean;
  date: Date | null;
  events: EventType[];
};
