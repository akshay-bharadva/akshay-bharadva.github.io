import { useState, useMemo } from "react";
import type { LearningSubject, LearningTopic, LearningSession } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Search,
  Book,
  CheckCircle2,
  Circle,
  PlayCircle,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface SubjectTopicTreeProps {
  subjects: LearningSubject[];
  topics: LearningTopic[];
  activeTopicId?: string | null;
  activeSession: LearningSession | null;
  onSelectTopic: (topic: LearningTopic) => void;
  onEditSubject: (subject: LearningSubject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditTopic: (topic: LearningTopic) => void;
  onDeleteTopic: (topicId: string) => void;
  onCreateSubject: () => void;
  onCreateTopic: (subjectId: string) => void;
}

const getStatusIcon = (status: string, isActive: boolean) => {
  const baseClasses = "size-4 shrink-0 transition-all duration-300";

  switch (status) {
    case "Mastered":
      return (
        <CheckCircle2
          className={cn(baseClasses, "text-green-500 fill-green-500/10")}
        />
      );
    case "Practicing":
      return (
        <PlayCircle
          className={cn(baseClasses, "text-orange-500 fill-orange-500/10")}
        />
      );
    case "Learning":
      return (
        <div className="relative flex items-center justify-center size-4">
          <div className="absolute size-4 bg-blue-500/30 rounded-full animate-ping" />
          <div className="size-3 bg-blue-500 rounded-full border-2 border-background" />
        </div>
      );
    default:
      return (
        <Circle
          className={cn(
            baseClasses,
            isActive ? "text-primary" : "text-muted-foreground/30",
          )}
        />
      );
  }
};

export default function SubjectTopicTree({
  subjects,
  topics,
  activeTopicId,
  activeSession,
  onSelectTopic,
  onEditSubject,
  onDeleteSubject,
  onEditTopic,
  onDeleteTopic,
  onCreateSubject,
  onCreateTopic,
}: SubjectTopicTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    const lowercasedQuery = searchQuery.toLowerCase();
    return subjects.filter((subject) => {
      const subjectMatches = subject.name
        .toLowerCase()
        .includes(lowercasedQuery);
      const hasMatchingTopics = topics.some(
        (t) =>
          t.subject_id === subject.id &&
          t.title.toLowerCase().includes(lowercasedQuery),
      );
      return subjectMatches || hasMatchingTopics;
    });
  }, [subjects, topics, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-muted/5 border-r border-border/50">
      {/* Search Header */}
      <div className="p-4 border-b space-y-3 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground flex items-center gap-2">
            <BrainCircuit className="size-4 text-primary" /> Curriculum
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCreateSubject}
            className="h-7 w-7"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 bg-background/50 text-xs focus-visible:ring-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="pb-10 space-y-3">
          <Accordion
            type="multiple"
            className="space-y-3"
            defaultValue={subjects.map((s) => s.id)}
          >
            {filteredSubjects.map((subject) => {
              const subjectTopics = topics.filter(
                (t) => t.subject_id === subject.id,
              );
              const visibleTopics = searchQuery
                ? subjectTopics.filter((t) =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                : subjectTopics;
              const completed = subjectTopics.filter(
                (t) => t.status === "Mastered",
              ).length;
              const total = subjectTopics.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <AccordionItem
                  value={subject.id}
                  key={subject.id}
                  className="border rounded-lg bg-card shadow-sm overflow-hidden group/item"
                >
                  {/* STICKY HEADER IMPLEMENTATION */}
                  <div className="sticky top-0 z-10 bg-card">
                    <div className="flex flex-col bg-secondary/5 border-b border-border/40">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <AccordionTrigger className="flex-1 py-0 hover:no-underline !no-underline text-sm font-semibold">
                          {subject.name}
                        </AccordionTrigger>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEditSubject(subject)}
                            >
                              <Edit2 className="mr-2 size-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onCreateTopic(subject.id)}
                            >
                              <Plus className="mr-2 size-3.5" /> Add Topic
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteSubject(subject.id)}
                            >
                              <Trash2 className="mr-2 size-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="px-3 pb-2.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-mono">
                          <span>{Math.round(progress)}% Complete</span>
                          <span>
                            {completed}/{total}
                          </span>
                        </div>
                        <Progress value={progress} className="h-1 bg-muted" />
                      </div>
                    </div>
                  </div>

                  <AccordionContent className="p-0 bg-background">
                    <div className="relative py-2 pl-3">
                      <div className="absolute top-2 bottom-4 w-px bg-border" />
                      {visibleTopics.length === 0 ? (
                        <div className="pl-12 py-4 text-xs text-muted-foreground italic flex flex-col gap-2">
                          No topics.
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-fit h-6 text-xs"
                            onClick={() => onCreateTopic(subject.id)}
                          >
                            Add Topic
                          </Button>
                        </div>
                      ) : (
                        visibleTopics.map((topic) => {
                          const isActive = activeTopicId === topic.id;
                          const isSessionActive =
                            activeSession?.topic_id === topic.id;
                          return (
                            <div
                              key={topic.id}
                              className={cn(
                                "group/topic relative pl-5 pr-2 py-2.5 flex items-start gap-3 cursor-pointer transition-all border-l-2 border-transparent hover:bg-muted/30",
                                isActive && "bg-primary/5 border-l-primary",
                              )}
                              onClick={() => onSelectTopic(topic)}
                            >
                              <div className=" z-10 bg-background">
                                {getStatusIcon(topic.status, isActive)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-xs font-medium leading-normal transition-colors",
                                    isActive
                                      ? "text-foreground"
                                      : "text-muted-foreground group-hover/topic:text-foreground",
                                    topic.status === "Mastered" &&
                                      !isActive &&
                                      "text-muted-foreground/70",
                                  )}
                                >
                                  {topic.title}
                                </p>
                                {isSessionActive && (
                                  <div className="mt-1 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                    </span>
                                    IN PROGRESS
                                  </div>
                                )}
                              </div>
                              <div className="opacity-0 group-hover/topic:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <MoreHorizontal className="size-3 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTopic(topic);
                                      }}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTopic(topic.id);
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {!searchQuery && visibleTopics.length > 0 && (
                        <div className="pl-10 pr-2 pt-2 pb-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-7 text-xs text-muted-foreground hover:text-primary gap-2"
                            onClick={() => onCreateTopic(subject.id)}
                          >
                            <Plus className="size-3" /> Add Topic
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl bg-muted/10">
              <Book className="size-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground mb-3">
                No modules found.
              </p>
              <Button size="sm" onClick={onCreateSubject}>
                Create Module
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
