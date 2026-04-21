import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface AnnualCumulativeTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      month: string;
      balance: number;
      income: number;
      expenses: number;
      netChange: number;
    };
  }>;
  label?: string;
}

export function AnnualCumulativeTooltip({
  active,
  payload,
  label,
}: AnnualCumulativeTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p
          className={cn(
            "font-mono",
            data.balance >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          End Balance: ${data.balance.toFixed(2)}
        </p>
        <Separator className="my-2" />
        <div className="space-y-1 text-xs">
          <p className="text-green-500">Earnings: ${data.income.toFixed(2)}</p>
          <p className="text-red-500">Expenses: ${data.expenses.toFixed(2)}</p>
          <p className="font-semibold">
            Net Change: ${data.netChange.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export interface ForecastTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      balance: number;
      events: string[];
    };
  }>;
  label?: string;
}

export function ForecastTooltip({
  active,
  payload,
  label,
}: ForecastTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p
          className={cn(
            "font-mono",
            data.balance >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          Projected Balance: ${data.balance.toFixed(2)}
        </p>
        {data.events.length > 0 && (
          <div className="mt-2 border-t pt-2 space-y-1">
            {data.events.map((event: string, index: number) => (
              <p key={index} className="text-xs text-muted-foreground">
                {event}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}
