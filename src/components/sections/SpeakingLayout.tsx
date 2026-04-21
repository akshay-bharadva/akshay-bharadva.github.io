import type { ElementType } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Mic, Newspaper, Wrench } from "lucide-react";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const TYPE_STYLES: Record<string, string> = {
  talk:      "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  article:   "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  podcast:   "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  workshop:  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  interview: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const TYPE_ICONS: Record<string, ElementType> = {
  talk: Mic, article: Newspaper, podcast: Mic, workshop: Wrench, interview: Mic,
};

export default function SpeakingLayout({ items }: SectionLayoutProps) {
  return (
    <motion.div className="space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
      {items.map(item => {
        const typeTag = (item.tags?.[0] || "talk").toLowerCase();
        const style = TYPE_STYLES[typeTag] || TYPE_STYLES.talk;
        const Icon = TYPE_ICONS[typeTag] || Mic;
        return (
          <motion.div key={item.id} variants={cardItemVariants} className="group relative">
            <div className="flex items-center gap-5 p-5 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              <div className={`relative size-10 rounded-xl flex items-center justify-center shrink-0 ${style}`}>
                <Icon className="size-4" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  {item.tags?.[0] && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${style}`}>
                      {item.tags[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                  {item.date_from && <span className="font-mono text-[11px] text-muted-foreground/60">{item.date_from}</span>}
                  {item.description && <span className="text-xs text-muted-foreground/70 hidden md:inline truncate max-w-xs">· {item.description}</span>}
                </div>
              </div>
              {item.link_url && (
                <Link href={item.link_url} target="_blank" rel="noopener noreferrer"
                  className="relative size-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors shrink-0">
                  <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
