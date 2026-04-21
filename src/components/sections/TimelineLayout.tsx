import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionLayoutProps } from "./shared";

const TimelineLayout = ({ items }: SectionLayoutProps) => (
  <div className="relative ml-3 md:ml-6 space-y-12">
    <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-border to-transparent" />
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        className="relative pl-8 md:pl-12"
        initial={{ opacity: 0, x: -20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
      >
        <div className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-primary ring-4 ring-background shadow-sm shadow-primary/20" />
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
            {(item.date_from || item.date_to) && (
              <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0">
                <Calendar className="size-3" />{item.date_from}{item.date_to && ` — ${item.date_to}`}
              </span>
            )}
          </div>
          {item.subtitle && <p className="text-sm font-medium text-primary/80 mb-3">{item.subtitle}</p>}
          {item.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/50">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
          {item.link_url && (
            <Link href={item.link_url} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mt-4">
              View Details <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      </motion.div>
    ))}
  </div>
);

export default TimelineLayout;
