import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { PortfolioItem } from "@/types";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

export default function UsesLayout({ items }: SectionLayoutProps) {
  const grouped = items.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
    const key = item.subtitle || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <motion.div className="space-y-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <motion.div key={category} variants={cardItemVariants}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mb-4">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryItems.map(item => (
              <div key={item.id} className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all duration-300">
                <div className="size-9 rounded-lg bg-secondary/60 border border-border/50 flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
                  {item.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                  {item.description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</div>}
                </div>
                {item.link_url && (
                  <Link href={item.link_url} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
