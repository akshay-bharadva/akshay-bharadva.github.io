import { motion } from "framer-motion";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

export default function ImpactNumbersLayout({ items }: SectionLayoutProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 rounded-2xl overflow-hidden border border-border/50 bg-border/30"
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerVariants}
    >
      {items.map(item => (
        <motion.div
          key={item.id}
          variants={cardItemVariants}
          className="group relative bg-card p-8 flex flex-col items-center justify-center text-center gap-2 hover:bg-secondary/30 transition-colors duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none mb-2 group-hover:text-primary transition-colors duration-300">
              {item.title}
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{item.subtitle}</div>
            {item.description && (
              <div className="text-[11px] text-muted-foreground/60 mt-1 max-w-[120px] leading-snug">{item.description}</div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
