import React, { useMemo } from "react";
import { Habit } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HabitStats({ habits }: { habits: Habit[] }) {
  const stats = useMemo(() => {
    let totalLogs = 0;
    let totalHabits = habits.length;

    habits.forEach((h) => {
      const logs = h.habit_logs?.length || 0;
      totalLogs += logs;
    });

    const xp = totalLogs * 15;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const prevLevelXp = Math.pow(level - 1, 2) * 100;
    const progress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

    return { totalLogs, xp, level, progress, totalHabits };
  }, [habits]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {/* Level Card */}
      <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 relative overflow-hidden">
        {/* Hide large decorative trophy on mobile to save space and reduce visual noise */}
        <div className="hidden sm:block absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="size-32" />
        </div>

        {/* Compact padding and horizontal flex on mobile */}
        <CardContent className="p-4 sm:p-6 flex flex-row items-center gap-4 relative z-10 text-left">
          <div className="size-12 sm:size-16 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 shadow-inner">
            <span className="text-xl sm:text-2xl font-black text-primary">
              {stats.level}
            </span>
          </div>
          <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-sm sm:text-lg truncate">
                  Consistency Level
                </h3>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Keep tracking to level up!
                </p>
              </div>
              <span className="font-mono text-xs font-medium text-primary whitespace-nowrap ml-2">
                {stats.xp} XP
              </span>
            </div>
            <Progress value={stats.progress} className="h-1.5 sm:h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Row on mobile, Column on Desktop */}
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-row md:flex-col justify-between items-center md:justify-center h-full gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:justify-between w-full">
            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Target className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Active</span> Habits
            </span>
            <span className="font-bold text-base sm:text-lg">
              {stats.totalHabits}
            </span>
          </div>

          {/* Vertical Divider for Mobile */}
          <div className="h-8 w-px bg-border md:hidden" />

          <div className="flex items-center gap-2 sm:justify-between w-full">
            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Total</span> Check-ins
            </span>
            <span className="font-bold text-base sm:text-lg">
              {stats.totalLogs}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
