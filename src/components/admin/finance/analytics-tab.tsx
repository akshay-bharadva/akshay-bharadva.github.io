import React, { useState, useMemo, FormEvent } from "react";
import {
  format,
  isBefore,
  isAfter,
  isSameDay,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { Transaction, RecurringTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  HandCoins,
  MoreVertical,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManageCategoryMutation } from "@/store/api/adminApi";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import { getFirstOccurrence, getNextOccurrence } from "@/lib/finance-utils";
import { CHART_COLORS } from "@/lib/constants";
import { StatCard } from "./index";
import { AnnualCumulativeTooltip } from "./chart-tooltips";
import MonthlyDetailSheet from "./monthly-detail-sheet";

const chartConfig = {
  earning: { label: "Earnings", color: "hsl(var(--chart-2))" },
  expense: { label: "Expenses", color: "hsl(var(--chart-5))" },
};

type CategoryData = {
  name: string;
  total: number;
  count: number;
  percentage: number;
  fill: string;
  avg: number;
};

type CategoryAction = {
  type: "edit" | "merge" | "delete";
  category: CategoryData;
} | null;

export interface AnalyticsTabProps {
  transactions: Transaction[];
  allYears: number[];
  allCategories: string[];
  recurring: RecurringTransaction[];
}

export default function AnalyticsTab({
  transactions,
  allYears,
  allCategories,
  recurring,
}: AnalyticsTabProps) {
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [selectedMonthData, setSelectedMonthData] = useState<{
    month: string;
    year: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<CategoryAction>(null);
  const [manageCategory] = useManageCategoryMutation();

  const yearTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => parseLocalDate(t.date).getFullYear() === analyticsYear
      ),
    [transactions, analyticsYear]
  );

  const annualCumulativeData = useMemo(() => {
    const yearStartDate = startOfYear(new Date(analyticsYear, 0, 1));
    const startingBalance = transactions
      .filter((t) => isBefore(parseLocalDate(t.date), yearStartDate))
      .reduce(
        (acc, t) => acc + (t.type === "earning" ? t.amount : -t.amount),
        0
      );

    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(analyticsYear, i), "MMM"),
      income: 0,
      expenses: 0,
    }));

    yearTransactions.forEach((t) => {
      const monthIndex = parseLocalDate(t.date).getMonth();
      if (t.type === "earning") {
        allMonths[monthIndex].income += t.amount;
      } else {
        allMonths[monthIndex].expenses += t.amount;
      }
    });

    // Add projected recurring transactions
    recurring.forEach((rule) => {
      let nextDate = rule.last_processed_date
        ? getNextOccurrence(parseLocalDate(rule.last_processed_date), rule)
        : getFirstOccurrence(parseLocalDate(rule.start_date), rule);
      while (isBefore(nextDate, startOfYear(new Date(analyticsYear, 0, 1)))) {
        nextDate = getNextOccurrence(nextDate, rule);
      }
      let safety = 0;
      while (
        isBefore(nextDate, endOfYear(new Date(analyticsYear, 0, 1))) &&
        safety < 100
      ) {
        const ruleEndDate = rule.end_date
          ? parseLocalDate(rule.end_date)
          : null;
        if (ruleEndDate && isAfter(nextDate, ruleEndDate)) break;
        const alreadyLogged = yearTransactions.some(
          (t) =>
            t.recurring_transaction_id === rule.id &&
            isSameDay(parseLocalDate(t.date), nextDate)
        );

        if (!alreadyLogged) {
          const monthIndex = nextDate.getMonth();
          if (rule.type === "earning")
            allMonths[monthIndex].income += rule.amount;
          else allMonths[monthIndex].expenses += rule.amount;
        }
        nextDate = getNextOccurrence(nextDate, rule);
        safety++;
      }
    });

    let cumulativeBalance = startingBalance;
    return allMonths.map((monthData) => {
      const netChange = monthData.income - monthData.expenses;
      cumulativeBalance += netChange;
      return { ...monthData, netChange, balance: cumulativeBalance };
    });
  }, [analyticsYear, transactions, recurring, yearTransactions]);

  const { annualStats, monthlyChartData, expenseByCategory } = useMemo(() => {
    let totalIncome = 0,
      totalExpenses = 0;
    const categoryMap: Record<string, { total: number; count: number }> = {};
    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

    yearTransactions.forEach((t) => {
      const month = format(parseLocalDate(t.date), "MMM");
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
      if (t.type === "earning") {
        totalIncome += t.amount;
        monthlyData[month].income += t.amount;
      } else {
        totalExpenses += t.amount;
        monthlyData[month].expenses += t.amount;
        const category = t.category || "Uncategorized";
        if (!categoryMap[category])
          categoryMap[category] = { total: 0, count: 0 };
        categoryMap[category].total += t.amount;
        categoryMap[category].count += 1;
      }
    });

    const sortedCategories = Object.entries(categoryMap).sort(
      (a, b) => b[1].total - a[1].total
    );
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      format(new Date(analyticsYear, i), "MMM")
    );
    const chartData = allMonths.map((month) => ({
      month,
      ...(monthlyData[month] || { income: 0, expenses: 0 }),
    }));

    const categoryData: CategoryData[] = Object.entries(categoryMap)
      .map(([name, { total, count }], index) => ({
        name,
        total,
        count,
        avg: count > 0 ? total / count : 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      annualStats: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        topExpenseCategory: topCategory
          ? `${topCategory[0]} ($${topCategory[1].total.toFixed(2)})`
          : "N/A",
      },
      monthlyChartData: chartData,
      expenseByCategory: categoryData,
    };
  }, [yearTransactions, analyticsYear]);

  const handleBarClick = (data: { activePayload?: { payload: { month: string } }[] }) => {
    if (data?.activePayload && data.activePayload.length > 0) {
      const month = data.activePayload[0].payload.month;
      setSelectedMonthData({ month, year: analyticsYear });
    }
  };

  const handleAction = async (
    type: "edit" | "merge" | "delete",
    oldName: string,
    newName?: string
  ) => {
    try {
      await manageCategory({ type, oldName, newName }).unwrap();
      toast.success(`Category action "${type}" successful.`);
    } catch (err: unknown) {
      toast.error(`Failed to ${type} category`, { description: getErrorMessage(err) });
    }
    setActionDialog(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <Card>
        <CardHeader className="md:flex-row md:items-center justify-between">
          <div>
            <CardTitle>Annual Report</CardTitle>
            <CardDescription>
              Financial summary for {analyticsYear}.
            </CardDescription>
          </div>
          <Select
            value={String(analyticsYear)}
            onValueChange={(v) => setAnalyticsYear(Number(v))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={`$${annualStats.totalIncome.toFixed(2)}`}
              icon={<ArrowUp />}
            />
            <StatCard
              title="Total Expenses"
              value={`$${annualStats.totalExpenses.toFixed(2)}`}
              icon={<ArrowDown />}
            />
            <StatCard
              title="Net Income"
              value={`${annualStats.netIncome < 0 ? "-" : ""}$${Math.abs(annualStats.netIncome).toFixed(2)}`}
              className={
                annualStats.netIncome < 0 ? "text-red-500" : "text-green-500"
              }
              icon={<HandCoins />}
            />
            <StatCard
              title="Top Expense"
              value={annualStats.topExpenseCategory}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
            <ChartContainer
              config={chartConfig}
              className="h-64 sm:h-72 w-full"
            >
              <BarChart data={monthlyChartData} onClick={handleBarClick}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(value) => `$${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="var(--color-earning)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="var(--color-expense)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative Balance</CardTitle>
          <CardDescription>Projected year-end trend.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 sm:h-72 w-full">
            <LineChart
              data={annualCumulativeData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `$${value / 1000}k`}
                width={40}
              />
              <RechartsTooltip content={<AnnualCumulativeTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine
                y={0}
                stroke="hsl(var(--destructive))"
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
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Spending by category.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    onClick={(data) =>
                      setSelectedCategory(
                        selectedCategory === data.name ? null : data.name
                      )
                    }
                    className="cursor-pointer"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke={
                          selectedCategory === entry.name
                            ? "hsl(var(--primary))"
                            : ""
                        }
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<ChartTooltipContent nameKey="name" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="md:col-span-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseByCategory
                  .filter((c) =>
                    selectedCategory ? c.name === selectedCategory : true
                  )
                  .map((cat) => (
                    <TableRow key={cat.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.fill }}
                        />
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${cat.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() =>
                                setActionDialog({ type: "edit", category: cat })
                              }
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                setActionDialog({
                                  type: "merge",
                                  category: cat,
                                })
                              }
                            >
                              Merge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() =>
                                setActionDialog({
                                  type: "delete",
                                  category: cat,
                                })
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedMonthData && (
        <MonthlyDetailSheet
          month={selectedMonthData.month}
          year={selectedMonthData.year}
          transactions={yearTransactions}
          onClose={() => setSelectedMonthData(null)}
        />
      )}

      <Dialog
        open={!!actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionDialog?.type} Category: "{actionDialog?.category.name}"
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === "edit" &&
                "This will rename the category for all associated transactions."}
              {actionDialog?.type === "merge" &&
                `This will merge all "${actionDialog.category.name}" transactions into another category.`}
              {actionDialog?.type === "delete" &&
                `This will remove the category tag from all associated transactions.`}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newName = formData.get("newName") as string;
              if (actionDialog)
                handleAction(
                  actionDialog.type,
                  actionDialog.category.name,
                  newName
                );
            }}
          >
            {actionDialog?.type === "edit" && (
              <div className="space-y-2 py-4">
                <Label htmlFor="newName">New Category Name</Label>
                <Input
                  id="newName"
                  name="newName"
                  defaultValue={actionDialog.category.name}
                  required
                  autoFocus
                />
              </div>
            )}
            {actionDialog?.type === "merge" && (
              <div className="space-y-2 py-4">
                <Label htmlFor="newName">Target Category</Label>
                <Select name="newName" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories
                      .filter((c) => c !== actionDialog.category.name)
                      .map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActionDialog(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={
                  actionDialog?.type === "delete" ? "destructive" : "default"
                }
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
