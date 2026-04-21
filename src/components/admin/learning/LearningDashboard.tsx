import React, { useMemo } from "react";
import type { LearningSession, LearningTopic, LearningSubject } from "@/types";
import {
  subDays,
  startOfWeek,
  format,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Layers, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// --- HEATMAP ---
const Heatmap = ({
  data,
  days,
}: {
  data: Record<string, number>;
  days: Date[];
}) => {
  const getColor = (m: number) => {
    if (m <= 0) return "bg-muted/50";
    if (m < 30) return "bg-primary/20";
    if (m < 60) return "bg-primary/50";
    return "bg-primary";
  };

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {days.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const minutes = data[dateKey] || 0;
        return (
          <TooltipProvider key={dateKey}>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 rounded-[3px] transition-colors",
                    getColor(minutes),
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-sm">{minutes} mins</p>
                <p className="text-xs text-muted-foreground">
                  {format(day, "MMM do, yyyy")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default function LearningDashboard({
  sessions,
  topics,
  subjects,
}: {
  sessions: LearningSession[];
  topics: LearningTopic[];
  subjects: LearningSubject[];
}) {
  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce(
      (acc, s) => acc + (s.duration_minutes || 0),
      0,
    );
    return { totalHours: (totalMinutes / 60).toFixed(1) };
  }, [sessions]);

  const { heatmapData, gridDays } = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, 364));
    const days = eachDayOfInterval({ start, end: today });
    const data = sessions.reduce((acc: Record<string, number>, s) => {
      if (!s.duration_minutes) return acc;
      const key = format(startOfDay(new Date(s.start_time)), "yyyy-MM-dd");
      acc[key] = (acc[key] || 0) + s.duration_minutes;
      return acc;
    }, {});
    return { heatmapData: data, gridDays: days };
  }, [sessions]);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Clock className="size-4" /> Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {stats.totalHours}
              <span className="text-lg font-medium text-muted-foreground ml-1">
                hrs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Layers className="size-4" /> Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{subjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="size-4" /> Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{topics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Zap className="size-4 text-yellow-500" /> Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{sessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Consistency Heatmap */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
          Consistency Log
        </h3>
        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <Heatmap data={heatmapData} days={gridDays} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Module Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Star className="size-5 text-yellow-500 fill-yellow-500" /> Module
            Progress
          </h3>
        </div>

        {subjects.length === 0 ? (
          <div className="p-12 border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center text-center">
            <div className="size-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Layers className="size-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold">Your curriculum is empty</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create a Subject to begin tracking your roadmap.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => {
              const subTopics = topics.filter(
                (t) => t.subject_id === subject.id,
              );
              const completed = subTopics.filter(
                (t) => t.status === "Mastered",
              ).length;
              const total = subTopics.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <Card
                  key={subject.id}
                  className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                    <CardTitle
                      className="truncate text-base"
                      title={subject.name}
                    >
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Completion
                        </span>
                        <span className="text-sm font-mono text-foreground">
                          {completed} / {total}
                        </span>
                      </div>
                      <span className="text-xl font-black text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
