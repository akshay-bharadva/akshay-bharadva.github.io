// Financial goal card with animated progress fill

import React from "react";
import { motion } from "framer-motion";
import type { FinancialGoal } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";

export interface GoalCardProps {
  /** The financial goal to display */
  goal: FinancialGoal;
  /** Callback when "Add Funds" button is clicked */
  onAddFunds: () => void;
  /** Callback when "Edit" menu item is selected */
  onEdit: () => void;
  /** Callback when "Delete" menu item is selected */
  onDelete: () => void;
}

export default function GoalCard({
  goal,
  onAddFunds,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const percentage = Math.min(
    (goal.current_amount / goal.target_amount) * 100,
    100
  );

  return (
    <Card className="relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-[320px] group">
      {/* Animated progress fill from bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-primary/10 -z-0"
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-background/70 group-hover:bg-background/80 transition-colors z-10" />

      {/* Content Layer */}
      <div className="relative z-20 flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="leading-tight truncate pr-4 text-foreground drop-shadow-md">
              {goal.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-background/50"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-grow flex-col justify-center text-center py-4">
          <div>
            <p className="text-5xl font-black text-primary drop-shadow-sm">
              {percentage.toFixed(0)}
              <span className="text-2xl text-primary/70">%</span>
            </p>
            <p className="font-semibold text-muted-foreground text-sm mt-1">
              ${goal.current_amount.toLocaleString()} / $
              {goal.target_amount.toLocaleString()}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-4">
          <Button size="sm" className="w-full shadow-lg" onClick={onAddFunds}>
            <Plus className="mr-2 size-4" /> Add Funds
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
