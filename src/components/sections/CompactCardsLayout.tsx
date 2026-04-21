import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const CompactCardsLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="flex flex-wrap gap-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants}>
        {item.link_url ? (
          <a href={item.link_url} target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</span>
            {item.subtitle && <span className="text-xs text-muted-foreground hidden sm:inline">· {item.subtitle}</span>}
            <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 shadow-sm">
            <span className="text-sm font-medium text-foreground">{item.title}</span>
            {item.subtitle && <span className="text-xs text-muted-foreground">· {item.subtitle}</span>}
          </div>
        )}
      </motion.div>
    ))}
  </motion.div>
);

export default CompactCardsLayout;
