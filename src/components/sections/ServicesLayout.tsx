import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const SERVICE_ICON_COLORS = [
  "bg-blue-500/10 text-blue-500",
  "bg-violet-500/10 text-violet-500",
  "bg-emerald-500/10 text-emerald-500",
  "bg-amber-500/10 text-amber-500",
  "bg-rose-500/10 text-rose-500",
];

const ServicesLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map((item, i) => {
      const colorClass = SERVICE_ICON_COLORS[i % SERVICE_ICON_COLORS.length];
      return (
        <motion.div key={item.id} variants={cardItemVariants}
          className="group relative rounded-xl border border-border/50 bg-card p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col gap-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* <div className={`relative size-11 rounded-xl ${colorClass} flex items-center justify-center`}>
            <Wrench className="size-5" />
          </div> */}
          <div className="relative">
            <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-1">{item.title}</h3>
            {item.subtitle && <p className="text-xs font-mono text-muted-foreground mb-3">{item.subtitle}</p>}
            {item.description && <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="relative flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/40">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-secondary/60 text-muted-foreground border-transparent font-mono text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </motion.div>
      );
    })}
  </motion.div>
);

export default ServicesLayout;
