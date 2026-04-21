import { useState, useMemo } from "react";
import type { LearningSubject, LearningTopic } from "@/types";
import { Plus, Loader2, X, Clock, BookOpen, Zap, Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useGetLearningDataQuery, useDeleteSubjectMutation, useDeleteTopicMutation } from "@/store/api/adminApi";
import { useAppSelector } from "@/store/hooks";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { PageHeader, ManagerWrapper } from "./shared";
import ModuleCard from "./learning/ModuleCard";
import TopicEditor from "./learning/TopicEditor";
import SubjectForm from "./learning/SubjectForm";
import TopicForm from "./learning/TopicForm";
import { subDays, startOfWeek, format, eachDayOfInterval, startOfDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, getErrorMessage } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import StatCard from "@/components/admin/shared/StatCard";

type SheetState = 
  | { type: "create-subject" } 
  | { type: "edit-subject"; data: LearningSubject } 
  | { type: "create-topic"; subjectId: string } 
  | { type: "edit-topic"; data: LearningTopic } 
  | null;

const Heatmap = ({ data, days }: { data: Record<string, number>; days: Date[] }) => {
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
          <TooltipProvider key={dateKey} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <div className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-[3px] transition-colors", getColor(minutes))} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-sm">{minutes} mins</p>
                <p className="text-xs text-muted-foreground">{format(day, "MMM do, yyyy")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default function LearningManager() {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const [sheetState, setSheetState] = useState<SheetState>(null);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(!isMobile);
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);

  const { data, isLoading } = useGetLearningDataQuery();
  const { activeSession } = useAppSelector((state) => state.learningSession);
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const subjects = data?.subjects || [];
  const topics = data?.topics || [];
  const sessions = data?.sessions || [];

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
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

  const handleSaveSuccess = () => setSheetState(null);

  const handleDelete = async (type: "subject" | "topic", id: string) => {
    const ok = await confirm({
      title: `Delete ${type === "subject" ? "Module" : "Topic"}?`,
      description: `This cannot be undone.`,
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const mutation = type === "subject" ? deleteSubject : deleteTopic;
      await mutation(id).unwrap();
      toast.success(`${type === "subject" ? "Module" : "Topic"} deleted`);
      if (type === 'topic' && selectedTopic?.id === id) {
        setSelectedTopic(null);
      }
    } catch (err) {
      toast.error("Delete failed", { description: getErrorMessage(err) });
    }
  };

  if (isLoading) {
    return (
      <ManagerWrapper>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="size-10 animate-spin text-muted-foreground/30" />
        </div>
      </ManagerWrapper>
    );
  }

  // --- FULL SCREEN EDITOR MODE ---
  // Replaces the entire dashboard when a topic is selected.
  // This solves the "side by side sucks" issue by focusing purely on content.
  if (selectedTopic) {
    return (
      // We pass 0 padding on mobile to maximize space, normal padding on desktop
      <ManagerWrapper className="p-0 md:p-6 h-[calc(100vh-4rem)]"> 
        <TopicEditor
          topic={selectedTopic}
          onBack={() => setSelectedTopic(null)}
          onTopicUpdate={(updated) => {
            if (selectedTopic?.id === updated.id) setSelectedTopic(updated);
          }}
        />
      </ManagerWrapper>
    );
  }

  // --- DASHBOARD MODE ---
  return (
    <ManagerWrapper>
      <PageHeader
        title="Learning"
        description="Track your personal curriculum and knowledge base"
        actions={
          <Button onClick={() => setSheetState({ type: "create-subject" })}>
            <Plus className="mr-2 size-4" /> New Module
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Study Time" value={`${stats.totalHours} hrs`} icon={Clock} highlight />
          <StatCard title="Modules" value={subjects.length} icon={Layers} />
          <StatCard title="Topics" value={topics.length} icon={BookOpen} />
          <StatCard title="Sessions" value={sessions.length} icon={Zap} />
        </div>

        <Collapsible open={isHeatmapOpen} onOpenChange={setIsHeatmapOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Consistency Log</CardTitle>
                  <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", isHeatmapOpen && "rotate-180")} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 overflow-x-auto">
                <div className="min-w-[600px] md:min-w-full">
                  <Heatmap data={heatmapData} days={gridDays} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Modules</h3>
          {subjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Layers className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold mb-1">No modules yet</p>
                <Button onClick={() => setSheetState({ type: "create-subject" })}><Plus className="mr-2 size-4" /> Create First Module</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <ModuleCard
                  key={subject.id}
                  subject={subject}
                  topics={topics.filter((t) => t.subject_id === subject.id)}
                  activeSession={activeSession}
                  onTopicClick={(topic) => setSelectedTopic(topic)}
                  onEditSubject={() => setSheetState({ type: "edit-subject", data: subject })}
                  onDeleteSubject={() => handleDelete("subject", subject.id)}
                  onAddTopic={() => setSheetState({ type: "create-topic", subjectId: subject.id })}
                  onEditTopic={(topic) => setSheetState({ type: "edit-topic", data: topic })}
                  onDeleteTopic={(id) => handleDelete("topic", id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!sheetState} onOpenChange={(open) => !open && setSheetState(null)}>
        <SheetContent className="sm:max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <SheetHeader>
              <SheetTitle>{sheetState?.type?.includes("create") ? "Create" : "Edit"} {sheetState?.type?.includes("subject") ? "Module" : "Topic"}</SheetTitle>
              <SheetDescription>Configure details.</SheetDescription>
            </SheetHeader>
            <SheetClose asChild><Button variant="ghost" size="icon"><X className="size-4" /></Button></SheetClose>
          </div>
          {(sheetState?.type === "create-subject" || sheetState?.type === "edit-subject") && (
            <SubjectForm subject={sheetState.type === "edit-subject" ? sheetState.data : null} onSuccess={handleSaveSuccess} />
          )}
          {(sheetState?.type === "create-topic" || sheetState?.type === "edit-topic") && (
            <TopicForm
              topic={sheetState.type === "edit-topic" ? sheetState.data : null}
              subjects={subjects}
              defaultSubjectId={sheetState.type === "create-topic" ? sheetState.subjectId : undefined}
              onSuccess={handleSaveSuccess}
            />
          )}
        </SheetContent>
      </Sheet>
    </ManagerWrapper>
  );
}