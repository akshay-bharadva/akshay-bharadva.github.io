import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";

export type DialogState = {
  type: "transaction" | "recurring" | "goal" | "addFunds" | null;
  data?: Transaction | RecurringTransaction | FinancialGoal;
};

export type ForecastDataPoint = {
  date: string;
  balance: number;
  events: string[];
};
