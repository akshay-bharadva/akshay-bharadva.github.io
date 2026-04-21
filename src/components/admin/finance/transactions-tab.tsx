import React from "react";
import type { Transaction } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";

export interface TransactionsTabProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string, description: string) => void;
}

export default function TransactionsTab({
  transactions,
  onEdit,
  onDelete,
}: TransactionsTabProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function TransactionRow({
  transaction: t,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string, description: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {format(parseLocalDate(t.date), "MMM dd")}
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="truncate max-w-[140px] sm:max-w-xs">
            {t.description}
          </span>
          <Badge variant="secondary" className="md:hidden w-fit text-[10px]">
            {t.category || "General"}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline">{t.category || "–"}</Badge>
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-semibold font-mono whitespace-nowrap",
          t.type === "earning" ? "text-green-500" : "text-red-500",
        )}
      >
        {t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(t)}>
              <Edit className="mr-2 size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => onDelete(t.id, t.description)}
            >
              <Trash2 className="mr-2 size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
