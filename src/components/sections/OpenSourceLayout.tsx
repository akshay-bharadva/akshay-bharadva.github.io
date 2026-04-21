import { motion } from "framer-motion";
import { ArrowUpRight, GitPullRequest, Star } from "lucide-react";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

export default function OpenSourceLayout({ items }: SectionLayoutProps) {
  return (
    <motion.div className="space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
      {items.map(item => (
        <motion.div key={item.id} variants={cardItemVariants} className="group relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              <div className="size-8 rounded-lg bg-secondary/60 border border-border/50 flex items-center justify-center shrink-0">
                <GitPullRequest className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{item.title}</div>
                {item.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</div>}
              </div>
            </div>
            {item.description && (
              <p className="relative text-sm text-muted-foreground leading-relaxed flex-1 hidden md:block">{item.description}</p>
            )}
            <div className="relative flex items-center gap-2 shrink-0">
              {item.tags && item.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                  <Star className="size-3" fill="currentColor" /> {tag.replace(/[★*]/g, "").trim()}
                </span>
              ))}
              {item.link_url && (
                <Link href={item.link_url} target="_blank" rel="noopener noreferrer"
                  className="size-7 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                  <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
