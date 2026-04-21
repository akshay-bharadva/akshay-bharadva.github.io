import { useState, FormEvent } from "react";
import type { PortfolioSection } from "@/types";
import {
  X, Eye, List, Clock, Grid2X2, Grid3X3, Image, LayoutList,
  BarChart3, Columns, Star, Github, BookOpen, Quote, Briefcase,
  TrendingUp, GitPullRequest, Mic, Trophy, Building2, Zap, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import type { PathOption } from "./types";

// ─── Layout registry ──────────────────────────────────

const LAYOUT_OPTIONS = [
  // ── existing ──
  {
    value: "default",
    label: "Default List",
    icon: List,
    group: "Basic",
    description: "Clean rows with tags and dates on the right",
  },
  {
    value: "timeline",
    label: "Timeline",
    icon: Clock,
    group: "Basic",
    description: "Vertical timeline with dot markers and cards",
  },
  {
    value: "grid-2-col",
    label: "Grid — 2 Columns",
    icon: Grid2X2,
    group: "Basic",
    description: "Two-column card grid with hover effects",
  },
  {
    value: "grid-3-col",
    label: "Grid — 3 Columns",
    icon: Grid3X3,
    group: "Basic",
    description: "Three-column compact card grid",
  },
  {
    value: "cards-with-image",
    label: "Cards with Image",
    icon: Image,
    group: "Basic",
    description: "Two-column cards with image headers",
  },
  {
    value: "compact-cards",
    label: "Compact / Chips",
    icon: LayoutList,
    group: "Basic",
    description: "Inline chip-style tags, great for tools or skills",
  },
  {
    value: "stats-grid",
    label: "Stats Grid",
    icon: BarChart3,
    group: "Basic",
    description: "Number-focused grid for metrics and achievements",
  },
  {
    value: "masonry",
    label: "Masonry",
    icon: Columns,
    group: "Basic",
    description: "Pinterest-style staggered grid with images",
  },
  {
    value: "feature-alternating",
    label: "Featured Projects",
    icon: Star,
    group: "Basic",
    description: "Large alternating layout with overlapping description",
  },
  {
    value: "github-grid",
    label: "GitHub Grid",
    icon: Github,
    group: "Basic",
    description: "Auto-fetched GitHub repository cards",
  },
  // ── must-haves ──
  {
    value: "case-study",
    label: "Case Study",
    icon: BookOpen,
    group: "Must-haves",
    description: "Problem → approach → outcome with hero image and outcome metrics",
  },
  {
    value: "services",
    label: "Services",
    icon: Wrench,
    group: "Must-haves",
    description: "Icon + title + description tiles for what you offer",
  },
  {
    value: "work-experience",
    label: "Work Experience",
    icon: Briefcase,
    group: "Must-haves",
    description: "Company logo, role, dates, and bullet impact lines",
  },
  {
    value: "testimonials",
    label: "Testimonials",
    icon: Quote,
    group: "Must-haves",
    description: "Attributed quotes with avatar, name, and role",
  },
  // ── high signal ──
  {
    value: "impact-numbers",
    label: "Impact Numbers",
    icon: TrendingUp,
    group: "High Signal",
    description: "Quantified results — big bold numbers in a seamless grid",
  },
  {
    value: "open-source",
    label: "Open Source",
    icon: GitPullRequest,
    group: "High Signal",
    description: "Repos contributed to with PR counts and star ratings",
  },
  {
    value: "speaking",
    label: "Speaking / Writing",
    icon: Mic,
    group: "High Signal",
    description: "Talks, articles, podcasts, and workshops with type badges",
  },
  // ── creative ──
  {
    value: "press-awards",
    label: "Press / Awards",
    icon: Trophy,
    group: "Creative",
    description: "Recognition strip — Awwwards, publications, accolades",
  },
  {
    value: "client-logos",
    label: "Client Logos",
    icon: Building2,
    group: "Creative",
    description: '"Worked with" logo grid, grayscale → colour on hover',
  },
  {
    value: "now-page",
    label: "Now Page",
    icon: Zap,
    group: "Creative",
    description: "What you're doing right now — work, reading, travel",
  },
  {
    value: "uses",
    label: "Uses / Setup",
    icon: Wrench,
    group: "Creative",
    description: "Tools, editor, hardware — grouped by category",
  },
];

const LAYOUT_GROUPS = ["Basic", "Must-haves", "High Signal", "Creative"] as const;

const GROUP_BADGE: Record<string, string> = {
  "Basic":       "bg-secondary text-muted-foreground",
  "Must-haves":  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "High Signal": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Creative":    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

// ─── Mini preview renderers ────────────────────────────

function LayoutPreview({ layout }: { layout: string }) {
  const block = "rounded bg-muted/50 border border-border/50";
  const bar   = "h-2 rounded-full bg-muted-foreground/20";
  const sbar  = "h-1.5 rounded-full bg-muted-foreground/15";
  const tag   = "h-1.5 w-6 rounded-full bg-primary/30";
  const dot   = "size-2 rounded-full bg-primary";

  switch (layout) {
    // ── existing previews ──
    case "timeline":
      return (
        <div className="space-y-2.5 pl-3 border-l-2 border-primary/30 py-1">
          {[0,1,2].map(i => (
            <div key={i} className="relative">
              <div className="absolute -left-[17px] top-1.5"><div className={dot} /></div>
              <div className={`${block} p-2.5 space-y-1`}>
                <div className={`${bar} w-2/3`} /><div className={`${sbar} w-full`} />
                <div className="flex gap-1">{[0,1].map(j => <div key={j} className={tag} />)}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "grid-2-col":
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0,1,2,3].map(i => (
            <div key={i} className={`${block} p-2.5 space-y-1`}>
              <div className={`${bar} w-3/4`} /><div className={`${sbar} w-full`} />
              <div className="flex gap-1">{[0,1].map(j => <div key={j} className={tag} />)}</div>
            </div>
          ))}
        </div>
      );
    case "grid-3-col":
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(i => (
            <div key={i} className={`${block} p-2 space-y-1`}>
              <div className={`${bar} w-3/4`} /><div className={`${sbar} w-full`} /><div className={tag} />
            </div>
          ))}
        </div>
      );
    case "cards-with-image":
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0,1].map(i => (
            <div key={i} className={`${block} overflow-hidden`}>
              <div className="h-9 bg-gradient-to-br from-primary/10 to-accent/10" />
              <div className="p-2 space-y-1"><div className={`${bar} w-2/3`} /><div className={`${sbar} w-full`} /></div>
            </div>
          ))}
        </div>
      );
    case "compact-cards":
      return (
        <div className="flex flex-wrap gap-1.5">
          {["Design", "Dev", "Strategy", "API"].map(l => (
            <div key={l} className={`${block} px-2.5 py-1 text-[9px] text-muted-foreground`}>{l}</div>
          ))}
        </div>
      );
    case "stats-grid":
      return (
        <div className="grid grid-cols-4 gap-1.5">
          {["42+","1.2k","5yr","∞"].map(s => (
            <div key={s} className={`${block} p-2 text-center`}>
              <div className="text-xs font-bold text-foreground">{s}</div>
              <div className={`${sbar} w-full mt-1`} />
            </div>
          ))}
        </div>
      );
    case "masonry":
      return (
        <div className="columns-3 gap-2">
          {[40,28,50,32,44,36].map((h,i) => (
            <div key={i} className={`${block} mb-2 break-inside-avoid`} style={{ height: h }}>
              <div className="p-1.5"><div className={`${sbar} w-3/4`} /></div>
            </div>
          ))}
        </div>
      );
    case "feature-alternating":
      return (
        <div className="space-y-2.5">
          {[0,1].map(i => (
            <div key={i} className={`flex gap-2 ${i % 2 ? "flex-row-reverse" : ""}`}>
              <div className={`${block} flex-1 h-10 bg-gradient-to-br from-primary/10 to-accent/10`} />
              <div className="flex-1 space-y-1 py-1">
                <div className="text-[9px] text-primary font-mono">Featured</div>
                <div className={`${bar} w-2/3`} /><div className={`${sbar} w-full`} />
              </div>
            </div>
          ))}
        </div>
      );
    case "github-grid":
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(i => (
            <div key={i} className={`${block} p-2 space-y-1`}>
              <div className={`${bar} w-2/3`} /><div className={`${sbar} w-full`} />
              <div className="flex gap-1 items-center"><div className={tag} /><span className="text-[8px] text-muted-foreground">★ 0</span></div>
            </div>
          ))}
        </div>
      );
    case "default":
      return (
        <div className="space-y-1.5">
          {[0,1,2].map(i => (
            <div key={i} className={`${block} p-2.5 flex items-center justify-between`}>
              <div className="space-y-1 flex-1"><div className={`${bar} w-1/3`} /><div className={`${sbar} w-1/2`} /></div>
              <div className="flex gap-1">{[0,1].map(j => <div key={j} className={tag} />)}</div>
            </div>
          ))}
        </div>
      );

    // ── new previews ──
    case "case-study":
      return (
        <div className="space-y-2">
          <div className="h-16 rounded bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50" />
          <div className="grid grid-cols-[1fr_60px] gap-2">
            <div className="space-y-2">
              {[["01","bg-blue-500/20 text-blue-600"],["02","bg-violet-500/20 text-violet-600"],["03","bg-emerald-500/20 text-emerald-600"]].map(([n, c]) => (
                <div key={n} className="flex gap-2 items-start">
                  <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${c}`}>{n}</span>
                  <div className="flex-1 space-y-0.5"><div className={`${sbar} w-full`} /><div className={`${sbar} w-3/4`} /></div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {["60%","12k","2×"].map(v => (
                <div key={v} className={`${block} p-1.5 text-center`}>
                  <div className="text-[10px] font-bold text-foreground">{v}</div>
                  <div className={`${sbar} w-full mt-0.5`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "services":
      return (
        <div className="grid grid-cols-3 gap-2">
          {[["bg-blue-500/10","text-blue-500"],["bg-violet-500/10","text-violet-500"],["bg-emerald-500/10","text-emerald-500"]].map(([bg, tc], i) => (
            <div key={i} className={`${block} p-2.5 space-y-2`}>
              <div className={`size-6 rounded-md ${bg} flex items-center justify-center`}>
                <div className={`size-3 rounded-sm ${tc} opacity-60`} />
              </div>
              <div className={`${bar} w-3/4`} /><div className={`${sbar} w-full`} /><div className={`${sbar} w-2/3`} />
            </div>
          ))}
        </div>
      );
    case "work-experience":
      return (
        <div className="space-y-3">
          {[0,1].map(i => (
            <div key={i} className="grid grid-cols-[48px_1fr] gap-2">
              <div className="space-y-1.5">
                <div className="size-8 rounded-lg border border-border/50 bg-card" />
                <div className={`${sbar} w-full`} />
              </div>
              <div className="space-y-1 pt-0.5">
                <div className={`${bar} w-1/2`} />
                <div className={`${sbar} w-full`} /><div className={`${sbar} w-3/4`} />
                <div className="flex gap-1 mt-1">{[0,1].map(j => <div key={j} className={tag} />)}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "testimonials":
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0,1].map(i => (
            <div key={i} className={`${block} p-3 space-y-2`}>
              <div className={`${sbar} w-full`} /><div className={`${sbar} w-5/6`} /><div className={`${sbar} w-3/4`} />
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/30">
                <div className="size-4 rounded-full bg-muted-foreground/20" />
                <div className="space-y-0.5"><div className={`${sbar} w-12`} /><div className="h-1 rounded-full bg-muted-foreground/10 w-8" /></div>
              </div>
            </div>
          ))}
        </div>
      );
    case "impact-numbers":
      return (
        <div className="grid grid-cols-4 gap-px bg-border/30 rounded-lg overflow-hidden border border-border/50">
          {["60%","12k","4yr","30+"].map(v => (
            <div key={v} className="bg-card p-2.5 text-center">
              <div className="text-sm font-bold text-foreground">{v}</div>
              <div className={`${sbar} w-full mt-1`} />
            </div>
          ))}
        </div>
      );
    case "open-source":
      return (
        <div className="space-y-1.5">
          {["vercel/next.js","tailwindlabs/tw","shadcn/ui"].map(r => (
            <div key={r} className={`${block} p-2 flex items-center gap-2`}>
              <div className="size-5 rounded bg-muted-foreground/10" />
              <div className="flex-1 space-y-0.5"><div className="font-mono text-[9px] text-muted-foreground">{r}</div><div className={`${sbar} w-2/3`} /></div>
              <div className="text-[9px] text-amber-500 font-mono">★ 128k</div>
            </div>
          ))}
        </div>
      );
    case "speaking":
      return (
        <div className="space-y-1.5">
          {[["Talk","bg-rose-500/10 text-rose-500","JSConf 2024"],["Article","bg-blue-500/10 text-blue-500","Smashing Mag"],["Podcast","bg-violet-500/10 text-violet-500","Syntax.fm"]].map(([t,c,v]) => (
            <div key={t} className={`${block} p-2 flex items-center gap-2`}>
              <div className={`size-6 rounded-lg flex items-center justify-center ${c} text-[8px] font-bold`}>{t[0]}</div>
              <div className="flex-1 space-y-0.5"><div className={`${sbar} w-3/4`} /><div className="text-[8px] text-muted-foreground">{v}</div></div>
            </div>
          ))}
        </div>
      );
    case "press-awards":
      return (
        <div className="flex flex-wrap gap-1.5">
          {["Awwwards SOTD","CSS Awards","Product Hunt #1","Smashing Mag"].map(a => (
            <div key={a} className={`${block} px-2.5 py-1.5 text-[9px] font-medium text-muted-foreground`}>{a}</div>
          ))}
        </div>
      );
    case "client-logos":
      return (
        <div className="grid grid-cols-4 gap-2">
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} className={`${block} aspect-square flex items-center justify-center`}>
              <div className="size-5 bg-muted-foreground/15 rounded" />
            </div>
          ))}
        </div>
      );
    case "now-page":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <div className="text-[8px] font-mono text-muted-foreground">Updated March 2026</div>
          </div>
          {[["bg-emerald-500","Work"],["bg-blue-500","Reading"],["bg-amber-500","Travel"]].map(([c,l]) => (
            <div key={l} className={`${block} p-2 flex items-start gap-2`}>
              <div className={`size-2 rounded-full mt-1 shrink-0 ${c}`} />
              <div className="space-y-0.5"><div className="text-[8px] font-mono text-muted-foreground">{l}</div><div className={`${sbar} w-full`} /></div>
            </div>
          ))}
        </div>
      );
    case "uses":
      return (
        <div className="space-y-2.5">
          {[["Editor","Neovim","tmux"],["Hardware","MacBook","HHKB"]].map(([cat,...tools]) => (
            <div key={cat}>
              <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-wide mb-1">{cat}</div>
              <div className="grid grid-cols-2 gap-1">
                {tools.map(t => (
                  <div key={t} className={`${block} p-2 flex items-center gap-1.5`}>
                    <div className="size-4 rounded bg-muted-foreground/15" />
                    <div className={`${sbar} flex-1`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ─── Sheet component ───────────────────────────────────

export interface SectionEditorSheetProps {
  section: Partial<PortfolioSection> | null;
  availablePaths: PathOption[];
  onSave: (data: Partial<PortfolioSection>) => void;
  onClose: () => void;
}

export default function SectionEditorSheet({
  section, availablePaths, onSave, onClose,
}: SectionEditorSheetProps) {
  const [pagePath, setPagePath]         = useState(section?.page_path || "/");
  const [selectedLayout, setSelectedLayout] = useState(section?.layout_style || "default");
  const [previewOpen, setPreviewOpen]   = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      id: section?.id,
      title: fd.get("title") as string,
      page_path: pagePath,
      type: fd.get("type") as PortfolioSection["type"],
      layout_style: selectedLayout,
    });
  };

  const selectedOption = LAYOUT_OPTIONS.find(o => o.value === selectedLayout);

  return (
    <>
      <Sheet open={true} onOpenChange={open => !open && onClose()}>
        <SheetContent className="sm:max-w-lg w-full flex flex-col">
          <div className="flex justify-between items-center">
            <SheetHeader>
              <SheetTitle>{section?.id ? "Edit Section" : "Create New Section"}</SheetTitle>
              <SheetDescription>Configure the section's properties and placement.</SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button type="button" variant="ghost"><X /></Button>
            </SheetClose>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-6 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={section?.title || ""} required />
            </div>
            <div className="space-y-1">
              <Label>Page Path *</Label>
              <Combobox options={availablePaths} value={pagePath} onChange={setPagePath}
                placeholder="Select or create path..." searchPlaceholder="Search paths..." emptyPlaceholder="No paths." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Content Type</Label>
              <Select name="type" defaultValue={section?.type || "list_items"} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="list_items">List of Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layout picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Layout Style</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setPreviewOpen(true)}>
                  <Eye className="size-3.5" /> Preview All
                </Button>
              </div>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LAYOUT_GROUPS.map(group => {
                    const groupItems = LAYOUT_OPTIONS.filter(o => o.group === group);
                    return (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">{group}</div>
                        {groupItems.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <opt.icon className="size-3.5 text-muted-foreground" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Inline preview */}
              {selectedOption && (
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <selectedOption.icon className="size-3.5 text-primary" />
                      {selectedOption.label}
                    </span>
                    <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${GROUP_BADGE[selectedOption.group]}`}>
                      {selectedOption.group}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{selectedOption.description}</p>
                  <div className="pt-2 border-t border-border/30">
                    <LayoutPreview layout={selectedLayout} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Section</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Preview All dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Layout Previews</DialogTitle></DialogHeader>
          <div className="space-y-8 pt-2">
            {LAYOUT_GROUPS.map(group => (
              <div key={group}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${GROUP_BADGE[group]}`}>{group}</span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LAYOUT_OPTIONS.filter(o => o.group === group).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSelectedLayout(opt.value); setPreviewOpen(false); }}
                      className={`rounded-xl border p-4 text-left space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        selectedLayout === opt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className={`size-4 ${selectedLayout === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{opt.label}</span>
                        {selectedLayout === opt.value && (
                          <span className="ml-auto text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                      <div className="border-t border-border/30 pt-3">
                        <LayoutPreview layout={opt.value} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}