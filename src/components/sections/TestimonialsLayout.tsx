import React from "react";
import { motion } from "framer-motion";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const TestimonialsLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.figure
        key={item.id}
        variants={cardItemVariants}
        className="group relative flex flex-col gap-5 rounded-xl border border-border/50 bg-card p-7 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      >
        {/* Quote mark */}
        <div className="absolute top-5 right-6 text-5xl font-serif leading-none text-primary/10 select-none">&quot;</div>
        <blockquote className="relative text-sm leading-relaxed text-foreground/90 flex-1">
          &quot;{item.title}&quot;
        </blockquote>
        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          {item.image_url ? (
            <img src={item.image_url} alt={item.subtitle || ""} className="size-10 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border shrink-0">
              <span className="text-sm font-bold text-primary">{(item.subtitle || "?").charAt(0)}</span>
            </div>
          )}
          <figcaption>
            <div className="text-sm font-semibold text-foreground">{item.subtitle}</div>
            {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
          </figcaption>
        </div>
      </motion.figure>
    ))}
  </motion.div>
);

export default TestimonialsLayout;
