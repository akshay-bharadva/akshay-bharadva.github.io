import { motion } from "framer-motion";
import Link from "next/link";
import { SectionLayoutProps, cardItemVariants, staggerVariants } from "./shared";

export default function PressAwardsLayout({ items }: SectionLayoutProps) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerVariants}>
      <motion.div variants={cardItemVariants} className="flex flex-wrap gap-3 items-center">
        {items.map(item => (
          <motion.div key={item.id} variants={cardItemVariants}>
            {item.link_url ? (
              <Link href={item.link_url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card px-6 py-4 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="h-7 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                )}
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center">{item.title}</span>
                {item.subtitle && <span className="font-mono text-[10px] text-muted-foreground/60">{item.subtitle}</span>}
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card px-6 py-4 shadow-sm">
                {item.image_url && <img src={item.image_url} alt={item.title} className="h-7 w-auto object-contain opacity-60 grayscale" />}
                <span className="text-xs font-semibold text-muted-foreground text-center">{item.title}</span>
                {item.subtitle && <span className="font-mono text-[10px] text-muted-foreground/60">{item.subtitle}</span>}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
