import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const MasonryLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="columns-1 gap-4 sm:columns-2 lg:columns-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants} className="break-inside-avoid mb-4">
        <div className="group relative rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {item.image_url && (
            <div className="overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
          )}
          <div className="p-5">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">{item.title}</h3>
            {item.subtitle && <p className="text-xs font-medium text-primary/80 mb-2">{item.subtitle}</p>}
            {item.description && <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                {item.tags.slice(0, 4).map(tag => (
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
        </div>
      </motion.div>
    ))}
  </motion.div>
);

export default MasonryLayout;
