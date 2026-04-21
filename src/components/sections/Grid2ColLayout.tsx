import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const Grid2ColLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.a key={item.id} variants={cardItemVariants} href={item.link_url || "#"} rel="noopener noreferrer" target="_blank"
        className="group relative rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </div>
          {item.subtitle && <p className="text-sm font-medium text-primary/80 mb-2">{item.subtitle}</p>}
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-border/50">
            {item.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
            ))}
          </div>
        )}
      </motion.a>
    ))}
  </motion.div>
);

export default Grid2ColLayout;
