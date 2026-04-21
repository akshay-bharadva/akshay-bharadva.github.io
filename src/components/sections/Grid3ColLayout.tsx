import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const Grid3ColLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants}
        className="group relative rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-6 flex-1 flex flex-col">
          <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">{item.title}</h3>
          {item.subtitle && <p className="text-xs font-medium text-primary/80 mb-2">{item.subtitle}</p>}
          <p className="text-sm leading-relaxed text-muted-foreground flex-1">{item.description}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/50">
              {item.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        {item.link_url && (
          <Link href={item.link_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10">
            <span className="sr-only">View {item.title}</span>
          </Link>
        )}
      </motion.div>
    ))}
  </motion.div>
);

export default Grid3ColLayout;
