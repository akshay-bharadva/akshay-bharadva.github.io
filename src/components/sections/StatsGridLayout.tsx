import React from "react";
import { motion } from "framer-motion";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

const StatsGridLayout = ({ items }: SectionLayoutProps) => (
  <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
    {items.map(item => (
      <motion.div key={item.id} variants={cardItemVariants}
        className="group rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="text-3xl md:text-4xl font-black text-foreground mb-1 tracking-tight">{item.title}</div>
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{item.subtitle || item.description}</div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

export default StatsGridLayout;
