import { useState } from "react";
import type { LearningSubject, LearningTopic, LearningSession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, Circle, CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  subject: LearningSubject;
  topics: LearningTopic[];
  activeSession: LearningSession | null;
  onTopicClick: (topic: LearningTopic) => void;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onAddTopic: () => void;
  onEditTopic: (topic: LearningTopic) => void;
  onDeleteTopic: (topicId: string) => void;
}

const statusConfig = {
  "To Learn": { icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  Learning: { icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  Practicing: { icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
  Mastered: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
};

export default function ModuleCard({
  subject,
  topics,
  activeSession,
  onTopicClick,
  onEditSubject,
  onDeleteSubject,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completed = topics.filter((t) => t.status === "Mastered").length;
  const total = topics.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 sm:p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn("size-8 rounded-lg flex items-center justify-center transition-transform duration-200 shrink-0", isExpanded ? "bg-primary/10" : "bg-muted")}>
              {isExpanded ? <ChevronDown className="size-4 text-primary" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-bold truncate">{subject.name}</CardTitle>
              {/* Desktop Progress */}
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{completed}/{total} topics</span>
                <Progress value={progress} className="h-1.5 w-20" />
                <span className="text-xs font-medium text-primary">{Math.round(progress)}%</span>
              </div>
              {/* Mobile Progress */}
              <div className="sm:hidden text-xs text-muted-foreground mt-0.5">{completed}/{total} done</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-8 shrink-0"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditSubject}><Edit className="mr-2 size-4" /> Edit Module</DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTopic}><Plus className="mr-2 size-4" /> Add Topic</DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteSubject} className="text-destructive"><Trash2 className="mr-2 size-4" /> Delete Module</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-2 sm:pb-4 border-t px-2 sm:px-4">
          {topics.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No topics yet</p>
              <Button variant="outline" size="sm" onClick={onAddTopic}><Plus className="mr-2 size-4" /> Add First Topic</Button>
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {topics.map((topic) => {
                const config = statusConfig[topic.status] || statusConfig["To Learn"];
                const StatusIcon = config.icon;
                const isActive = activeSession?.topic_id === topic.id;
                return (
                  <div key={topic.id} className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors group", isActive ? "bg-primary/10" : "hover:bg-muted/50")} onClick={() => onTopicClick(topic)}>
                    <StatusIcon className={cn("size-4 shrink-0", config.color)} />
                    <span className="flex-1 text-sm truncate">{topic.title}</span>
                    {isActive && <Badge variant="secondary" className="text-[9px] bg-primary/20 text-primary animate-pulse">ACTIVE</Badge>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTopic(topic)}><Edit className="mr-2 size-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteTopic(topic.id)} className="text-destructive"><Trash2 className="mr-2 size-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground mt-2" onClick={onAddTopic}><Plus className="mr-2 size-4" /> Add Topic</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}