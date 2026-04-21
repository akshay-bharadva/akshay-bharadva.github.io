import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import type { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { TrendingUp, TrendingDown, X as XIcon } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { StatCard } from "./index";
import { CHART_COLORS } from "@/lib/constants";

export interface MonthlyDetailSheetProps {
  month: string;
  year: number;
  transactions: Transaction[];
  onClose: () => void;
}

export default function MonthlyDetailSheet({
  month,
  year,
  transactions,
  onClose,
}: MonthlyDetailSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => format(parseLocalDate(t.date), "MMM") === month
      ),
    [transactions, month]
  );

  const { totalIncome, totalExpenses, expenseByCategory } = useMemo(() => {
    let income = 0,
      expenses = 0;
    const categoryMap: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      if (t.type === "earning") income += t.amount;
      else {
        expenses += t.amount;
        const cat = t.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      }
    });
    const expenseData = Object.entries(categoryMap)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      expenseByCategory: expenseData,
    };
  }, [monthTransactions]);

  const filteredTransactions = useMemo(
    () =>
      selectedCategory
        ? monthTransactions.filter(
            (t) => (t.category || "Uncategorized") === selectedCategory
          )
        : monthTransactions,
    [monthTransactions, selectedCategory]
  );

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              Financial Details for {month}, {year}
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <XIcon />
            </Button>
          </SheetClose>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] ">
          <div className="grid grid-cols-2 gap-4 my-4">
            <StatCard
              title="Income"
              value={`$${totalIncome.toFixed(2)}`}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Expenses"
              value={`$${totalExpenses.toFixed(2)}`}
              icon={<TrendingDown />}
            />
          </div>
          <h4 className="font-semibold mb-2">Expense Breakdown</h4>
          <ChartContainer config={{}} className="h-64 w-full -ml-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  onClick={(d) =>
                    setSelectedCategory(
                      selectedCategory === d.name ? null : d.name
                    )
                  }
                  className="cursor-pointer"
                >
                  {expenseByCategory.map((e, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={e.fill}
                      stroke={
                        selectedCategory === e.name ? "hsl(var(--primary))" : ""
                      }
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-between items-center my-4">
            <h4 className="font-semibold">
              {selectedCategory
                ? `Transactions in "${selectedCategory}"`
                : "All Transactions"}
            </h4>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <XIcon className="mr-2 size-4" />
                Clear
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary"
                >
                  <div className="overflow-hidden mr-2">
                    <p className="font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {format(parseLocalDate(t.date), "MMM dd")}
                      </p>
                      {t.category && (
                        <Badge
                          variant="outline"
                          className="hidden xs:inline-flex"
                        >
                          {t.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-bold text-sm whitespace-nowrap",
                      t.type === "earning" ? "text-chart-2" : "text-chart-5"
                    )}
                  >
                    {t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No transactions.
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
