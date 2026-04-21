import React, { useState, useEffect, useCallback } from "react";
import type { LearningTopic, LearningStatus } from "@/types";
import { useSaveTopicMutation } from "@/store/api/adminApi";
import NovelEditor from "@/components/admin/novel-editor";
import SessionTracker from "./SessionTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Plus, Link as LinkIcon, Video, FileText, Globe, GraduationCap, Layers, ExternalLink, Trash2, Hourglass } from "lucide-react";
import { cn, formatDate, getErrorMessage } from "@/lib/utils";
import { urlOrEmpty } from "@/lib/schemas";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

// --- HELPERS (Status, ResourceCard) ---
const STATUS_STEPS: { value: LearningStatus; label: string }[] = [{ value: "To Learn", label: "Queue" }, { value: "Learning", label: "Learning" }, { value: "Practicing", label: "Practicing" }, { value: "Mastered", label: "Mastered" }];

const StatusPipeline = ({ current, onChange }: { current: LearningStatus; onChange: (s: LearningStatus) => void; }) => (
  <div className="flex items-center p-1 bg-secondary/40 rounded-lg border border-border/50">
    {STATUS_STEPS.map((step) => (
      <button key={step.value} onClick={() => onChange(step.value)} className={cn("relative px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-md transition-all duration-200", current === step.value ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground/80 hover:bg-background/40")}>
        {step.label}
      </button>
    ))}
  </div>
);

const parseResource = (rawText: string | undefined | null) => {
  if (!rawText) return { type: "Link", title: "Untitled Resource" };
  const types = ["Article", "Video", "Course", "Official", "Roadmap", "OpenSource"];
  for (const type of types) {
    if (rawText.startsWith(type)) return { type, title: rawText.substring(type.length).trim() };
  }
  return { type: "Link", title: rawText };
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case "Video": return <Video className="size-3.5 text-red-500" />;
    case "Article": return <FileText className="size-3.5 text-blue-500" />;
    case "Course": return <GraduationCap className="size-3.5 text-green-500" />;
    case "Official": return <Globe className="size-3.5 text-sky-500" />;
    case "OpenSource": return <Globe className="size-3.5 text-purple-500" />;
    default: return <LinkIcon className="size-3.5 text-muted-foreground" />;
  }
};

const ResourceCard = ({ resource, onDelete }: { resource: { name: string; url: string }; onDelete: () => void; }) => {
  const { type, title } = parseResource(resource.name);
  return (
    <div className="group relative flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card hover:shadow-sm hover:border-primary/20 transition-all duration-200">
      <div className="mt-0.5 shrink-0 size-8 flex items-center justify-center bg-background rounded-lg border border-border shadow-sm">
        {getResourceIcon(type)}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant="secondary" className="text-[9px] h-4 px-1 rounded-[4px] font-mono font-normal uppercase tracking-wider text-muted-foreground/80">{type}</Badge>
        </div>
        <a href={resource.url} target="_blank" rel="noreferrer" className="block font-medium text-xs sm:text-sm leading-snug hover:text-primary hover:underline">{title || resource.name}</a>
      </div>
      <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="absolute top-2 right-2 p-1.5 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface TopicEditorProps {
  topic: LearningTopic | null;
  onBack: () => void;
  onTopicUpdate: (updatedTopic: LearningTopic) => void;
}

export default function TopicEditor({ topic, onBack, onTopicUpdate }: TopicEditorProps) {
  const isMobile = useIsMobile();
  const [coreNotes, setCoreNotes] = useState("");
  const [status, setStatus] = useState<LearningStatus>("To Learn");
  const [resources, setResources] = useState<{ name: string; url: string }[]>([]);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResName, setNewResName] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const [saveTopic, { isLoading: isSaving }] = useSaveTopicMutation();

  useEffect(() => {
    if (topic) {
      setCoreNotes(topic.core_notes || "");
      setStatus(topic.status || "To Learn");
      const rawResources = topic.resources || [];
      setResources(rawResources.map((res) => ({ name: res.name || "Untitled", url: res.url || "" })));
    }
  }, [topic]);

  const handleSave = useCallback(async (updateData: Partial<LearningTopic>, isAutosave = false) => {
    if (!topic) return;
    try {
      const updatedTopic = await saveTopic({ id: topic.id, ...updateData }).unwrap();
      if (!isAutosave) toast.success("Topic saved");
      onTopicUpdate(updatedTopic);
    } catch (err) {
      toast.error("Failed to save", { description: getErrorMessage(err) });
    }
  }, [topic, saveTopic, onTopicUpdate]);

  useEffect(() => {
    if (!topic || coreNotes === (topic.core_notes || "")) return;
    const handler = setTimeout(() => handleSave({ core_notes: coreNotes }, true), 2000);
    return () => clearTimeout(handler);
  }, [coreNotes, topic, handleSave]);

  const handleStatusChange = (newStatus: LearningStatus) => {
    setStatus(newStatus);
    handleSave({ status: newStatus });
  };

  const validateUrl = (url: string): boolean => {
    const result = urlOrEmpty.safeParse(url);
    if (!result.success) {
      setUrlError("Please enter a valid URL");
      return false;
    }
    setUrlError(null);
    return true;
  };

  const handleAddResource = () => {
    if (!newResName || !newResUrl || !validateUrl(newResUrl)) return;
    const updatedResources = [...resources, { name: newResName, url: newResUrl }];
    setResources(updatedResources);
    handleSave({ resources: updatedResources, core_notes: coreNotes });
    setNewResName("");
    setNewResUrl("");
    setIsAddResourceOpen(false);
  };

  const handleDeleteResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    handleSave({ resources: updatedResources, core_notes: coreNotes });
  };

  if (!topic) return null;

  return (
    <div className={cn(
      "flex flex-col h-full bg-background overflow-hidden",
      !isMobile && "rounded-xl border shadow-lg"
    )}>
      {/* 
        FIXED HEADER 
        Stays at the top of the viewport/container.
      */}
      <header className={cn(
        "border-b bg-background/80 backdrop-blur-md z-20 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0",
        !isMobile && "rounded-t-xl"
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate tracking-tight">{topic.title}</h1>
              {isSaving && <span className="text-[10px] text-primary animate-pulse font-mono">SAVING...</span>}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">EDITED: {formatDate(new Date(topic.updated_at || new Date()))}</p>
          </div>
        </div>
        <StatusPipeline current={status} onChange={handleStatusChange} />
      </header>
      
      {/*
        SCROLLABLE CONTENT AREA
        Desktop: side-by-side (editor | timer+resources)
        Mobile: stacked vertically
      */}
      <div className="flex-1 overflow-hidden">
        <div className={cn(
          "h-full",
          !isMobile && "flex gap-0"
        )}>
          {/* LEFT COLUMN: Editor (scrolls independently on desktop) */}
          <div className={cn(
            "overflow-y-auto",
            isMobile ? "h-auto" : "flex-1 min-w-0"
          )}>
            {/* Mobile-only: Timer above editor */}
            {isMobile && (
              <div className="px-4 pt-6 pb-2">
                <div className="bg-gradient-to-br from-background to-secondary/30 rounded-xl border border-border p-4 shadow-sm mb-6">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Hourglass className="size-3.5" /> Study Session
                  </div>
                  <SessionTracker topic={topic} />
                </div>
              </div>
            )}

            <div className="flex-1 px-4 pb-12 pt-4">
              <NovelEditor
                value={coreNotes}
                onChange={setCoreNotes}
                placeholder="Start taking notes..."
                minHeight="500px"
                isRounded={true}
                className="border-none shadow-none bg-transparent px-0"
              />
            </div>

            {/* Mobile-only: Resources below editor */}
            {isMobile && (
              <div className="px-6 pb-20 pt-4 border-t bg-muted/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Layers className="size-3.5" /> Resources <Badge variant="secondary" className="text-[9px] h-4 min-w-[20px] justify-center px-1">{resources.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => setIsAddResourceOpen(true)}>
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {resources.map((res, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, height: 0 }}>
                        <ResourceCard resource={res} onDelete={() => handleDeleteResource(i)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {resources.length === 0 && (
                    <div onClick={() => setIsAddResourceOpen(true)} className="border-2 border-dashed border-border/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-all">
                      <p className="text-xs font-medium text-foreground">Empty Library</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Add links, videos, or docs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Timer + Resources sidebar (desktop only, scrolls independently) */}
          {!isMobile && (
            <div className="w-80 xl:w-96 shrink-0 border-l overflow-y-auto bg-muted/5">
              {/* Timer */}
              <div className="p-4">
                <div className="bg-gradient-to-br from-background to-secondary/30 rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Hourglass className="size-3.5" /> Study Session
                  </div>
                  <SessionTracker topic={topic} />
                </div>
              </div>

              <Separator className="mx-4 w-auto" />

              {/* Resources */}
              <div className="p-4 pb-20">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Layers className="size-3.5" /> Resources <Badge variant="secondary" className="text-[9px] h-4 min-w-[20px] justify-center px-1">{resources.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary" onClick={() => setIsAddResourceOpen(true)}>
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {resources.map((res, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, height: 0 }}>
                        <ResourceCard resource={res} onDelete={() => handleDeleteResource(i)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {resources.length === 0 && (
                    <div onClick={() => setIsAddResourceOpen(true)} className="border-2 border-dashed border-border/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-all">
                      <p className="text-xs font-medium text-foreground">Empty Library</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Add links, videos, or docs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddResourceOpen} onOpenChange={(open) => { setIsAddResourceOpen(open); if(!open) { setUrlError(null); setNewResName(""); setNewResUrl(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. React Docs" value={newResName} onChange={(e) => setNewResName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input placeholder="https://..." value={newResUrl} onChange={(e) => { setNewResUrl(e.target.value); if(urlError) setUrlError(null); }} className={urlError ? "border-destructive" : ""} />
              {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddResourceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResource} disabled={!newResName || !newResUrl}>Add Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}