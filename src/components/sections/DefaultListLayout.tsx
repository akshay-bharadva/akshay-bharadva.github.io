import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const DefaultListLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants} className="group relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
          <div className="relative space-y-1 flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors flex items-center gap-2">
              {item.title}
              {item.link_url && <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />}
            </h3>
            {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
          </div>
          <div className="relative flex items-center gap-3 shrink-0">
            {item.tags && item.tags.length > 0 && (
              <div className="hidden md:flex gap-1.5">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}
            {item.date_to && (
              <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{item.date_to}</span>
            )}
          </div>
        </div>
        {item.link_url && (
          <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset">
            <span className="sr-only">View {item.title}</span>
          </a>
        )}
      </motion.div>
    ))}
  </motion.div>
);

export default DefaultListLayout;
