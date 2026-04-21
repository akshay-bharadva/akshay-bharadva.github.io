import React from "react";
import type { RecurringTransaction } from "@/types";
import type { ForecastDataPoint } from "./finance-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, Clock, Wallet } from "lucide-react";
import { StatCard, ForecastTooltip, UpcomingRecurringList } from "./index";

export interface DashboardTabProps {
  netIncome: number;
  totalEarnings: number;
  totalExpenses: number;
  forecastData: ForecastDataPoint[];
  recurring: RecurringTransaction[];
  onConfirmRecurring: (rule: RecurringTransaction, date: Date) => void;
}

export default function DashboardTab({
  netIncome,
  totalEarnings,
  totalExpenses,
  forecastData,
  recurring,
  onConfirmRecurring,
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Net Income"
          value={`${netIncome >= 0 ? "+" : "-"}$${Math.abs(netIncome).toFixed(2)}`}
          icon={<Wallet className="size-4" />}
          trend={netIncome >= 0 ? "up" : "down"}
          className={netIncome < 0 ? "border-red-500/20" : ""}
        />
        <StatCard
          title="Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={<ArrowUp className="size-4" />}
          trend="up"
        />
        <StatCard
          title="Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={<ArrowDown className="size-4" />}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart data={forecastData} />
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[250px] overflow-y-auto pr-1">
            <UpcomingRecurringList
              recurring={recurring}
              onConfirm={onConfirmRecurring}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ForecastChart({ data }: { data: ForecastDataPoint[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">30-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-48 w-full">
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border)/0.5)"
              />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))",
                }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))",
                }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip content={<ForecastTooltip />} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
