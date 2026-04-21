import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import PageSEO from "@/components/public/PageSEO";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout";
import PageWrapper from "@/components/public/PageWrapper";
import { config as appConfig } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { Search, X, Pin, Megaphone, Radio, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPublishedLifeUpdatesQuery,
  useGetSiteIdentityQuery,
} from "@/store/api/publicApi";
import { LIFE_UPDATE_CATEGORY_OPTIONS } from "@/lib/constants";
import type { LifeUpdate } from "@/types";

import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";

/* ── shared helpers ── */
const getCategoryMeta = (category: string) =>
  LIFE_UPDATE_CATEGORY_OPTIONS.find((c) => c.value === category) || {
    value: category,
    label: category,
    emoji: "📝",
  };

function getRelativeDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr, { month: "short", day: "numeric" });
}

/* ================================================================
   SCRAPBOOK LAYOUT
   ================================================================ */

function hashStr(id: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function getCardRotation(id: string): number {
  return ((hashStr(id, 0) % 7) - 3) * 0.8;
}

function getCardOffset(id: string): { x: number; y: number } {
  const h = hashStr(id, 1);
  return { x: ((h % 5) - 2) * 2, y: (((h >> 4) % 5) - 2) * 2 };
}

const tapeColors = [
  "bg-amber-300/60 dark:bg-amber-400/30",
  "bg-sky-300/60 dark:bg-sky-400/30",
  "bg-rose-300/60 dark:bg-rose-400/30",
  "bg-emerald-300/60 dark:bg-emerald-400/30",
  "bg-violet-300/60 dark:bg-violet-400/30",
];

/* ── Column count based on container width ── */
function useColumnCount(containerRef: React.RefObject<HTMLElement>): number {
  const [cols, setCols] = useState(1);

  const update = useCallback(() => {
    const w = containerRef.current?.offsetWidth ?? window.innerWidth;
    if (w >= 1024) setCols(3);
    else if (w >= 640) setCols(2);
    else setCols(1);
  }, [containerRef]);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [update, containerRef]);

  return cols;
}

/* ── Greedy shortest-column masonry, but items placed in date order ──
   Items arrive sorted newest→oldest. We place them one-by-one into
   whichever column is currently shortest, so reading order across
   columns stays roughly chronological left-to-right, top-to-bottom.   */
function MasonryGrid({ updates }: { updates: LifeUpdate[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colCount = useColumnCount(containerRef);

  // Split items into columns maintaining date order
  const columns = useMemo<LifeUpdate[][]>(() => {
    const cols: LifeUpdate[][] = Array.from({ length: colCount }, () => []);
    // Simple round-robin keeps date order across columns (left→right, top→bottom)
    updates.forEach((u, i) => cols[i % colCount].push(u));
    return cols;
  }, [updates, colCount]);

  return (
    <div ref={containerRef} className="flex gap-5 md:gap-6 items-start">
      {columns.map((col, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-5 md:gap-6">
          {col.map((update, idx) =>
            update.image_url ? (
              <PolaroidCard
                key={update.id}
                update={update}
                // global index so stagger delay is consistent across columns
                index={ci + idx * colCount}
              />
            ) : (
              <NoteCard
                key={update.id}
                update={update}
                index={ci + idx * colCount}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function getTapeColor(id: string): string {
  return tapeColors[Math.abs(hashStr(id, 2)) % tapeColors.length];
}

function PolaroidCard({
  update,
  index,
}: {
  update: LifeUpdate;
  index: number;
}) {
  const cat = getCategoryMeta(update.category);
  const rotation = getCardRotation(update.id);
  const offset = getCardOffset(update.id);
  const tape = getTapeColor(update.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{
        rotate: 0,
        scale: 1.03,
        y: -6,
        zIndex: 20,
        transition: { duration: 0.25 },
      }}
      style={{ translateX: offset.x, translateY: offset.y }}
      className="break-inside-avoid mb-5 md:mb-6 pt-3 cursor-default"
    >
      <div className="relative group">
        <div
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-16 ${tape} rounded-sm z-10 rotate-[-1deg] opacity-90`}
        />
        {update.is_pinned && (
          <div className="absolute -top-1 right-2 z-20">
            <div className="size-6 rounded-full bg-red-500 shadow-lg shadow-red-500/30 flex items-center justify-center">
              <Pin
                className="size-3 text-white rotate-45"
                fill="currentColor"
              />
            </div>
          </div>
        )}
        <div className="bg-card border border-border/50 rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.15),0_4px_6px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.4)] transition-shadow duration-300 group-hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] overflow-hidden">
          {update.image_url && (
            <div className="mx-3 mt-3 overflow-hidden rounded-sm bg-secondary/20">
              <img
                src={update.image_url}
                alt={update.title || "Update"}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm">{cat.emoji}</span>
              <span className="font-handwriting text-sm text-muted-foreground/70">
                {getRelativeDate(update.created_at)}
              </span>
            </div>
            {update.title && (
              <h3 className="font-bold text-base tracking-tight text-foreground leading-snug mb-1">
                {update.title}
              </h3>
            )}
            {update.content && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                {update.content}
              </p>
            )}
            {update.tags && update.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {update.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-handwriting text-sm text-primary/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 pt-2 border-t border-border/30">
              <Badge
                variant="secondary"
                className="text-[10px] font-normal bg-secondary/40 text-muted-foreground"
              >
                {cat.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function NoteCard({ update, index }: { update: LifeUpdate; index: number }) {
  const cat = getCategoryMeta(update.category);
  const rotation = getCardRotation(update.id);
  const offset = getCardOffset(update.id);
  const tape = getTapeColor(update.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{
        rotate: 0,
        scale: 1.03,
        y: -6,
        zIndex: 20,
        transition: { duration: 0.25 },
      }}
      style={{ translateX: offset.x, translateY: offset.y }}
      className="break-inside-avoid mb-5 md:mb-6 pt-3 cursor-default"
    >
      <div className="relative group">
        <div
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-14 ${tape} rounded-sm z-10 rotate-[1deg] opacity-90`}
        />
        {update.is_pinned && (
          <div className="absolute -top-1 right-2 z-20">
            <div className="size-6 rounded-full bg-red-500 shadow-lg shadow-red-500/30 flex items-center justify-center">
              <Pin
                className="size-3 text-white rotate-45"
                fill="currentColor"
              />
            </div>
          </div>
        )}
        <div className="bg-card border border-border/50 rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.4)] transition-shadow duration-300 group-hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] p-4">
          <span className="text-2xl block mb-2">{cat.emoji}</span>
          {update.title && (
            <h3 className="font-bold text-base tracking-tight text-foreground leading-snug mb-1.5">
              {update.title}
            </h3>
          )}
          {update.content && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {update.content}
            </p>
          )}
          {update.tags && update.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {update.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-handwriting text-sm text-primary/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
            <Badge
              variant="secondary"
              className="text-[10px] font-normal bg-secondary/40 text-muted-foreground"
            >
              {cat.label}
            </Badge>
            <span className="font-handwriting text-sm text-muted-foreground/60">
              {getRelativeDate(update.created_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ScrapbookView({ updates }: { updates: LifeUpdate[] }) {
  return (
    <motion.div variants={fadeSlideUp}>
      <MasonryGrid updates={updates} />
      <div className="text-center mt-12 mb-4">
        <p className="font-handwriting text-xl text-muted-foreground/40">
          ~ that&apos;s all for now ~
        </p>
      </div>
    </motion.div>
  );
}

function ScrapbookSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="break-inside-avoid mb-5 md:mb-6">
          <div className="bg-card border border-border/50 rounded-sm shadow-card p-3">
            {i % 2 === 0 && (
              <Skeleton className="h-40 w-full rounded-sm mb-3" />
            )}
            <div className="space-y-2 p-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   TIMELINE LAYOUT
   ================================================================ */

const categoryAccent: Record<string, string> = {
  watching:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  activity:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  photo:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  thought:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  milestone:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const categoryDot: Record<string, string> = {
  watching: "bg-blue-500 shadow-blue-500/40",
  activity: "bg-emerald-500 shadow-emerald-500/40",
  photo: "bg-amber-500 shadow-amber-500/40",
  thought: "bg-violet-500 shadow-violet-500/40",
  milestone: "bg-rose-500 shadow-rose-500/40",
};

function groupByMonth(updates: LifeUpdate[]) {
  const groups: { key: string; label: string; items: LifeUpdate[] }[] = [];
  const map = new Map<string, LifeUpdate[]>();

  for (const u of updates) {
    const d = new Date(u.created_at || Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!map.has(key)) {
      map.set(key, []);
      groups.push({ key, label, items: map.get(key)! });
    }
    map.get(key)!.push(u);
  }

  return groups;
}

function TimelineEntry({
  update,
  isLast,
}: {
  update: LifeUpdate;
  isLast: boolean;
}) {
  const cat = getCategoryMeta(update.category);
  const accent = categoryAccent[update.category] || categoryAccent.thought;
  const dot = categoryDot[update.category] || "bg-primary shadow-primary/40";

  return (
    <motion.article
      variants={fadeSlideUp}
      className="group relative grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr]"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative mt-1 z-10">
          <div
            className={`size-2.5 rounded-full ${dot} shadow-[0_0_8px] transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_12px]`}
          />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-border/60 to-border/20 mt-2" />
        )}
      </div>
      <div className="pb-8 md:pb-10 -mt-0.5">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium border ${accent} rounded-full px-2 py-0`}
          >
            {cat.emoji} {cat.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            {getRelativeDate(update.created_at)}
          </span>
          {update.is_pinned && (
            <Pin
              className="size-2.5 text-primary rotate-45"
              fill="currentColor"
            />
          )}
        </div>
        {update.title && (
          <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground mb-1 leading-snug group-hover:text-primary transition-colors duration-200">
            {update.title}
          </h3>
        )}
        {update.content && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-3 max-w-xl">
            {update.content}
          </p>
        )}
        {update.image_url && (
          <div className="relative overflow-hidden rounded-lg border border-border/30 bg-secondary/10 mb-3 max-w-md group/img">
            <img
              src={update.image_url}
              alt={update.title || "Update image"}
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover/img:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}
        {update.tags && update.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {update.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-muted-foreground/70 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function TimelineView({ updates }: { updates: LifeUpdate[] }) {
  const grouped = groupByMonth(updates);
  const pinnedUpdates = updates.filter((u) => u.is_pinned);
  const hasFilters = false; // timeline always shows pinned in-line

  return (
    <motion.div variants={fadeSlideUp}>
      {grouped.map((group) => {
        const items = group.items;
        if (items.length === 0) return null;

        return (
          <section key={group.key}>
            <div className="grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr] mb-1">
              <div className="flex justify-center">
                <div className="size-5 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                  <Calendar className="size-2.5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 -mt-0.5">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {items.map((update, idx) => (
                <TimelineEntry
                  key={update.id}
                  update={update}
                  isLast={idx === items.length - 1}
                />
              ))}
            </motion.div>
          </section>
        );
      })}
      <div className="grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr]">
        <div className="flex justify-center">
          <div className="size-1.5 rounded-full bg-border/60" />
        </div>
        <p className="text-[11px] text-muted-foreground/40 font-mono -mt-0.5">
          end of updates
        </p>
      </div>
    </motion.div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-5 w-32 mb-6 rounded-full" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[44px_1fr] md:grid-cols-[56px_1fr]"
        >
          <div className="flex flex-col items-center">
            <Skeleton className="size-2.5 rounded-full mt-1" />
            <div className="w-px flex-1 bg-border/30 mt-2" />
          </div>
          <div className="pb-10 space-y-2.5">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-3.5 w-4/5 max-w-xs" />
            {i % 2 === 0 && (
              <Skeleton className="h-40 w-full max-w-md rounded-lg" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function UpdatesPage() {
  const {
    data: updates = [],
    isLoading,
    error,
  } = useGetPublishedLifeUpdatesQuery();
  const { data: siteIdentity } = useGetSiteIdentityQuery();
  const { site: siteConfig } = appConfig;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const layout = siteIdentity?.profile_data?.updates_layout || "scrapbook";
  const isScrapbook = layout === "scrapbook";

  const filteredUpdates = useMemo(() => {
    let result = updates;
    if (selectedCategory) {
      result = result.filter((u) => u.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.title?.toLowerCase().includes(q) ||
          u.content?.toLowerCase().includes(q) ||
          u.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [updates, searchQuery, selectedCategory]);

  const activeCategories = useMemo(() => {
    const cats = new Set(updates.map((u) => u.category));
    return LIFE_UPDATE_CATEGORY_OPTIONS.filter((opt) => cats.has(opt.value));
  }, [updates]);

  const hasFilters = !!searchQuery || !!selectedCategory;

  return (
    <Layout>
      <PageSEO
        title={`Updates | ${siteIdentity?.profile_data.name || siteConfig.title}`}
        description={`Life updates and moments from ${siteIdentity?.profile_data.name || siteConfig.author}.`}
        url={`${siteConfig.url}/updates/`}
        ogImage={siteConfig.defaultOgImage}
      />

      <PageWrapper maxWidth={isScrapbook ? "wide" : "narrow"}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* ── Header ── */}
          <motion.header variants={fadeSlideUp} className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
              <Radio className="size-4" />
              <span>Updates</span>
            </div>
            <h1 className="font-display text-5xl font-black tracking-tighter text-foreground md:text-6xl">
              Life Updates<span className="text-primary">.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              What I&apos;m watching, doing, thinking, and celebrating.
            </p>
            {isScrapbook && (
              <p className="font-handwriting text-2xl text-muted-foreground/70 mt-2">
                ~ little moments, pinned here ~
              </p>
            )}
          </motion.header>

          {/* ── Search + Filters ── */}
          <motion.div variants={fadeSlideUp} className="mb-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search updates..."
                  className="pl-10 pr-10 h-11 bg-secondary/30 border-border/50 focus-visible:ring-primary/50 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-transparent"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="size-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                )}
              </div>

              {activeCategories.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    variant={!selectedCategory ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full h-8 text-xs"
                  >
                    All
                  </Button>
                  {activeCategories.map((cat) => (
                    <Button
                      key={cat.value}
                      size="sm"
                      variant={
                        selectedCategory === cat.value ? "default" : "outline"
                      }
                      onClick={() =>
                        setSelectedCategory(
                          cat.value === selectedCategory ? null : cat.value,
                        )
                      }
                      className="rounded-full h-8 text-xs"
                    >
                      {cat.emoji} {cat.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Content ── */}
          {isLoading ? (
            <motion.div variants={fadeSlideUp}>
              {isScrapbook ? <ScrapbookSkeleton /> : <TimelineSkeleton />}
            </motion.div>
          ) : !!error ? (
            <motion.div
              variants={fadeSlideUp}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <p className="text-destructive mb-2 font-medium">
                Failed to load updates.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again later.
              </p>
            </motion.div>
          ) : filteredUpdates.length === 0 ? (
            <motion.div
              variants={fadeSlideUp}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/50 mb-4">
                <Megaphone className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">No updates found</h3>
              <p className="text-muted-foreground mt-1">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Check back soon for new updates!"}
              </p>
              {hasFilters && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-2 text-primary"
                >
                  Clear filters
                </Button>
              )}
            </motion.div>
          ) : isScrapbook ? (
            <ScrapbookView updates={filteredUpdates} />
          ) : (
            <TimelineView updates={filteredUpdates} />
          )}
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}
