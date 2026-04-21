import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const CardsWithImageLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-2" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants}
        className="group relative rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
        {item.image_url ? (
          <div className="relative aspect-video overflow-hidden bg-secondary">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/5 via-secondary to-accent/5 flex items-center justify-center">
            <span className="text-muted-foreground/40 font-mono text-sm">No image</span>
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
            {item.link_url && <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />}
          </div>
          {item.subtitle && <p className="text-sm font-medium text-primary/80 mb-2">{item.subtitle}</p>}
          {item.description && <p className="text-sm leading-relaxed text-muted-foreground flex-1">{item.description}</p>}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/50">
              {item.tags.map(tag => (
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

export default CardsWithImageLayout;
