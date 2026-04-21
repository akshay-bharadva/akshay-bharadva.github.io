import { useState, FormEvent } from "react";
import type { PortfolioItem } from "@/types";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import NovelEditor from "@/components/admin/novel-editor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ─── Field hints per layout ───────────────────────────────────────────────────
// Describes how each field is used for a given layout_style so the editor
// can show contextual labels + placeholders instead of generic ones.

interface FieldHint {
  label: string;
  placeholder?: string;
  tip?: string;          // shown in tooltip next to label
  hide?: boolean;        // field is irrelevant for this layout — collapsed by default
  required?: boolean;
}

interface LayoutHints {
  _description: string;  // shown at top of form as a quick reminder
  title: FieldHint;
  subtitle?: FieldHint;
  date_from?: FieldHint;
  date_to?: FieldHint;
  description?: FieldHint;
  link_url?: FieldHint;
  image_url?: FieldHint;
  tags?: FieldHint;
}

const LAYOUT_HINTS: Record<string, LayoutHints> = {
  "case-study": {
    _description: "Each item is one case study. Tags become the outcome metric cards on the right.",
    title:       { label: "Project name", placeholder: "e.g. Meridian — SaaS Analytics Platform", required: true },
    subtitle:    { label: "One-line outcome / tagline", placeholder: "e.g. Rebuilt core dashboard reducing churn 28% in 90 days" },
    date_from:   { label: "Start date", placeholder: "e.g. Jan 2024" },
    date_to:     { label: "End date", placeholder: "e.g. Apr 2024" },
    description: { label: "Problem statement (markdown)", tip: "This renders under the '01 — Problem' step. Use markdown bullet lists for the approach." },
    link_url:    { label: "Live project / case study URL", placeholder: "https://..." },
    image_url:   { label: "Hero image URL", placeholder: "https://...", tip: "Shown as a full-width 16:7 banner above the content." },
    tags:        { label: "Outcome metrics (comma-separated)", placeholder: "60% faster, 12k stars, 2× revenue, $180k ARR saved", tip: "Each tag becomes a metric card. Format: 'value label', e.g. '60% faster load time'." },
  },
  "services": {
    _description: "Each item is one service offering tile.",
    title:       { label: "Service name", placeholder: "e.g. Full-Stack Development", required: true },
    subtitle:    { label: "Tech stack line", placeholder: "e.g. React · Node · Postgres" },
    description: { label: "Service pitch", placeholder: "One paragraph describing what you do and why it matters." },
    tags:        { label: "Deliverable chips (comma-separated)", placeholder: "Web apps, APIs, Auth, Deployment" },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
    link_url:    { label: "Link URL", hide: true },
  },
  "work-experience": {
    _description: "Each item is one employer. Use markdown bullet lines in description for impact statements.",
    title:       { label: "Company name", placeholder: "e.g. Vercel", required: true },
    subtitle:    { label: "Role / position", placeholder: "e.g. Senior Software Engineer" },
    date_from:   { label: "Start date", placeholder: "e.g. Mar 2022" },
    date_to:     { label: "End date", placeholder: "e.g. Present" },
    description: { label: "Impact bullets (markdown)", placeholder: "- Led X initiative...\n- Built Y feature...\n- Mentored Z engineers...", tip: "Use markdown `- ` bullets. Each renders with a → arrow prefix." },
    image_url:   { label: "Company logo URL", placeholder: "https://...", tip: "Falls back to 2-letter initials if left empty." },
    tags:        { label: "Tech used (comma-separated)", placeholder: "TypeScript, React, GraphQL, Postgres" },
    link_url:    { label: "Company website", placeholder: "https://..." },
  },
  "testimonials": {
    _description: "Each item is one testimonial. Title IS the quote — no need for quote marks.",
    title:       { label: "Quote text", placeholder: "One of the most complete engineers I've worked with...", required: true, tip: "Do not add quotation marks — the renderer adds them." },
    subtitle:    { label: "Person's full name", placeholder: "e.g. Guillermo Rauch" },
    description: { label: "Role & company", placeholder: "e.g. CEO, Vercel" },
    image_url:   { label: "Avatar URL", placeholder: "https://...", tip: "Falls back to first initial of the name." },
    date_from:   { label: "Date", hide: true },
    date_to:     { label: "Date to", hide: true },
    tags:        { label: "Tags", hide: true },
    link_url:    { label: "Link URL", hide: true },
  },
  "impact-numbers": {
    _description: "Each item is one big stat. Title is the number, subtitle is the label below it.",
    title:       { label: "Value", placeholder: "e.g. 60% or 12k or $2M+", required: true },
    subtitle:    { label: "Label", placeholder: "e.g. faster load time" },
    description: { label: "Context (optional)", placeholder: "Short sentence shown below the label.", tip: "Keep it under 10 words — space is tight." },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
    link_url:    { label: "Link URL", hide: true },
    tags:        { label: "Tags", hide: true },
  },
  "open-source": {
    _description: "Each item is one repository. Tags should be star counts like '128k'.",
    title:       { label: "Repo (org/name)", placeholder: "e.g. vercel/next.js", required: true },
    subtitle:    { label: "Contribution summary", placeholder: "e.g. 5 PRs merged · performance improvements" },
    description: { label: "What you built / fixed", placeholder: "One sentence describing the actual change." },
    link_url:    { label: "GitHub PR or repo URL", placeholder: "https://github.com/..." },
    tags:        { label: "Star count", placeholder: "e.g. 128k", tip: "Just the count as a single tag — rendered with a ★ icon." },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
  },
  "speaking": {
    _description: "First tag drives the icon and badge colour: Talk, Article, Podcast, or Workshop.",
    title:       { label: "Title of talk / article / episode", placeholder: "e.g. Building CLI tools developers actually love", required: true },
    subtitle:    { label: "Venue / publication", placeholder: "e.g. JSConf EU 2024 or Smashing Magazine" },
    date_from:   { label: "Date", placeholder: "e.g. May 2024" },
    description: { label: "Short summary", placeholder: "One sentence describing what it covers." },
    link_url:    { label: "Recording / article URL", placeholder: "https://..." },
    tags:        { label: "Type (first tag) + extras", placeholder: "Talk, CLI, DX", tip: "First tag must be one of: Talk, Article, Podcast, Workshop, Interview — this sets the icon and colour." },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
  },
  "press-awards": {
    _description: "Each item is one award, feature, or publication mention.",
    title:       { label: "Award / publication name", placeholder: "e.g. Awwwards SOTD", required: true },
    subtitle:    { label: "Date or issue", placeholder: "e.g. March 2024" },
    link_url:    { label: "Link to feature / award page", placeholder: "https://..." },
    image_url:   { label: "Logo URL", placeholder: "https://...", tip: "Shown greyscale, coloured on hover. Falls back to text if empty." },
    description: { label: "Brief context", placeholder: "Optional short note about the award." },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    tags:        { label: "Tags", hide: true },
  },
  "client-logos": {
    _description: "Each item is one client or collaborator. Logo shown greyscale, full colour on hover.",
    title:       { label: "Company name", placeholder: "e.g. Vercel", required: true, tip: "Used as alt text and falls back to 2-letter initials if no logo." },
    subtitle:    { label: "Relationship", placeholder: "e.g. Full-time · Contract · Advisor" },
    image_url:   { label: "Logo URL", placeholder: "https://...", tip: "Use a transparent PNG or SVG for best results." },
    link_url:    { label: "Company website", placeholder: "https://..." },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    description: { label: "Description", hide: true },
    tags:        { label: "Tags", hide: true },
  },
  "now-page": {
    _description: "Each item is one 'now' entry. Subtitle sets the category colour dot.",
    title:       { label: "What you're doing", placeholder: "e.g. Building a new design system at Vercel", required: true },
    subtitle:    { label: "Category", placeholder: "Work · Reading · Learning · Travel · Health · Thinking", tip: "Controls the colour dot. Must be one of the listed values (case-insensitive)." },
    description: { label: "Extra detail (optional)", placeholder: "Short supporting sentence." },
    date_from:   { label: "Updated date (first item only)", placeholder: "e.g. Updated March 2026", tip: "Only fill on the first item — shown at the top of the section as the 'last updated' timestamp." },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
    link_url:    { label: "Link URL", hide: true },
    tags:        { label: "Tags", hide: true },
  },
  "uses": {
    _description: "Items are grouped by subtitle (category). All items with the same subtitle appear under one heading.",
    title:       { label: "Tool / item name", placeholder: "e.g. Neovim", required: true },
    subtitle:    { label: "Category (used for grouping)", placeholder: "Editor · Terminal · Hardware · Design · Workflow · Notes", tip: "Items with the same subtitle are grouped together under one heading." },
    description: { label: "Why you use it", placeholder: "Short sentence — shows on hover." },
    link_url:    { label: "Product page URL", placeholder: "https://..." },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    image_url:   { label: "Image URL", hide: true },
    tags:        { label: "Tags", hide: true },
  },
  "testimonials-carousel": {
    _description: "Same as testimonials — title is the quote.",
    title:       { label: "Quote text", required: true },
    subtitle:    { label: "Person's full name" },
    description: { label: "Role & company" },
    image_url:   { label: "Avatar URL" },
    date_from:   { label: "Date from", hide: true },
    date_to:     { label: "Date to", hide: true },
    tags:        { label: "Tags", hide: true },
    link_url:    { label: "Link URL", hide: true },
  },
};

// Fallback hints for layouts not listed above (timeline, grid-*, masonry, etc.)
const DEFAULT_HINTS: LayoutHints = {
  _description: "",
  title:       { label: "Title", required: true },
  subtitle:    { label: "Subtitle" },
  date_from:   { label: "From", placeholder: "e.g. Jan 2022" },
  date_to:     { label: "To", placeholder: "e.g. Present" },
  description: { label: "Description" },
  link_url:    { label: "Link URL", placeholder: "https://..." },
  image_url:   { label: "Image URL", placeholder: "https://..." },
  tags:        { label: "Tags (comma-separated)", placeholder: "tag1, tag2, tag3" },
};

function getHints(layoutStyle?: string): LayoutHints {
  return layoutStyle ? (LAYOUT_HINTS[layoutStyle] ?? DEFAULT_HINTS) : DEFAULT_HINTS;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ label, tip, required }: { label: string; tip?: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {tip && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {tip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ItemEditorSheetProps {
  item: Partial<PortfolioItem> | null;
  sectionId: string;
  layoutStyle?: string;   // pass the parent section's layout_style
  onSave: (data: Partial<PortfolioItem>, sectionId: string) => void;
  onClose: () => void;
}

export default function ItemEditorSheet({
  item,
  sectionId,
  layoutStyle,
  onSave,
  onClose,
}: ItemEditorSheetProps) {
  const hints = getHints(layoutStyle);

  const [formData, setFormData] = useState({
    title:          item?.title          ?? "",
    subtitle:       item?.subtitle       ?? "",
    date_from:      item?.date_from      ?? "",
    date_to:        item?.date_to        ?? "",
    description:    item?.description    ?? "",
    link_url:       item?.link_url       ?? "",
    image_url:      item?.image_url      ?? "",
    tags:           item?.tags?.join(", ") ?? "",
    internal_notes: item?.internal_notes ?? "",
  });

  const [notesOpen, setNotesOpen] = useState(!!item?.internal_notes);

  const set = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(
      {
        id:             item?.id,
        title:          formData.title,
        subtitle:       formData.subtitle       || null,
        date_from:      formData.date_from      || null,
        date_to:        formData.date_to        || null,
        description:    formData.description    || null,
        link_url:       formData.link_url       || null,
        image_url:      formData.image_url      || null,
        tags:           formData.tags.split(",").map(t => t.trim()).filter(Boolean) || null,
        internal_notes: formData.internal_notes || null,
      },
      sectionId,
    );
    onClose();
  };

  // Decide whether to use the rich editor or plain textarea for description
  // (rich editor for layouts where description is long-form markdown)
  const useRichDescription = !["impact-numbers", "client-logos", "now-page"].includes(layoutStyle ?? "");
  const descHide = hints.description?.hide;

  return (
    <Sheet open={true} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <SheetHeader className="text-left">
            <SheetTitle>{item?.id ? "Edit Item" : "Create New Item"}</SheetTitle>
            <SheetDescription>
              {hints._description || "Fill in the details for this portfolio item."}
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon"><X className="size-4" /></Button>
          </SheetClose>
        </div>

        {/* Layout badge */}
        {layoutStyle && (
          <div className="px-6 pt-4 shrink-0">
            <Badge variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary border-transparent">
              {layoutStyle}
            </Badge>
          </div>
        )}

        {/* Scrollable form */}
        <ScrollArea className="flex-1">
          <form id="item-form" onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── Title ── */}
            <div className="space-y-1.5">
              <FieldLabel label={hints.title.label} tip={hints.title.tip} required={hints.title.required} />
              <Input
                value={formData.title}
                onChange={set("title")}
                placeholder={hints.title.placeholder}
                required
                autoFocus
              />
            </div>

            {/* ── Subtitle ── */}
            {!hints.subtitle?.hide && (
              <div className="space-y-1.5">
                <FieldLabel label={hints.subtitle?.label ?? "Subtitle"} tip={hints.subtitle?.tip} />
                <Input
                  value={formData.subtitle}
                  onChange={set("subtitle")}
                  placeholder={hints.subtitle?.placeholder}
                />
              </div>
            )}

            {/* ── Dates ── */}
            {(!hints.date_from?.hide || !hints.date_to?.hide) && (
              <div className="grid grid-cols-2 gap-4">
                {!hints.date_from?.hide && (
                  <div className="space-y-1.5">
                    <FieldLabel label={hints.date_from?.label ?? "From"} tip={hints.date_from?.tip} />
                    <Input
                      value={formData.date_from}
                      onChange={set("date_from")}
                      placeholder={hints.date_from?.placeholder ?? "e.g. Jan 2022"}
                    />
                  </div>
                )}
                {!hints.date_to?.hide && (
                  <div className="space-y-1.5">
                    <FieldLabel label={hints.date_to?.label ?? "To"} tip={hints.date_to?.tip} />
                    <Input
                      value={formData.date_to}
                      onChange={set("date_to")}
                      placeholder={hints.date_to?.placeholder ?? "e.g. Present"}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Description ── */}
            {!descHide && (
              <div className="space-y-1.5">
                <FieldLabel label={hints.description?.label ?? "Description"} tip={hints.description?.tip} />
                {useRichDescription ? (
                  <NovelEditor
                    value={formData.description}
                    onChange={val => setFormData(f => ({ ...f, description: val }))}
                    placeholder={hints.description?.placeholder ?? "Describe this item..."}
                    minHeight="180px"
                  />
                ) : (
                  <Textarea
                    value={formData.description}
                    onChange={set("description")}
                    placeholder={hints.description?.placeholder ?? "Short description..."}
                    rows={3}
                    className="resize-none text-sm"
                  />
                )}
              </div>
            )}

            {/* ── Image URL ── */}
            {!hints.image_url?.hide && (
              <div className="space-y-1.5">
                <FieldLabel label={hints.image_url?.label ?? "Image URL"} tip={hints.image_url?.tip} />
                <Input
                  value={formData.image_url}
                  onChange={set("image_url")}
                  placeholder={hints.image_url?.placeholder ?? "https://..."}
                />
                {formData.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 aspect-video">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Link URL ── */}
            {!hints.link_url?.hide && (
              <div className="space-y-1.5">
                <FieldLabel label={hints.link_url?.label ?? "Link URL"} tip={hints.link_url?.tip} />
                <Input
                  value={formData.link_url}
                  onChange={set("link_url")}
                  placeholder={hints.link_url?.placeholder ?? "https://..."}
                />
              </div>
            )}

            {/* ── Tags ── */}
            {!hints.tags?.hide && (
              <div className="space-y-1.5">
                <FieldLabel label={hints.tags?.label ?? "Tags (comma-separated)"} tip={hints.tags?.tip} />
                <Input
                  value={formData.tags}
                  onChange={set("tags")}
                  placeholder={hints.tags?.placeholder ?? "tag1, tag2, tag3"}
                />
                {/* Live tag preview */}
                {formData.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary border-transparent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Internal notes (collapsible) ── */}
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1.5 -ml-1">
                  <span>{notesOpen ? "▾" : "▸"}</span>
                  Internal notes
                  {formData.internal_notes && (
                    <span className="size-1.5 rounded-full bg-primary inline-block" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Textarea
                  value={formData.internal_notes}
                  onChange={set("internal_notes")}
                  placeholder="Private notes — never shown publicly. Useful for reminders, source links, or context."
                  rows={3}
                  className="resize-none text-sm text-muted-foreground"
                />
              </CollapsibleContent>
            </Collapsible>

          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-background shrink-0">
          <Button type="submit" form="item-form" className="w-full">
            {item?.id ? "Save changes" : "Create item"}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}