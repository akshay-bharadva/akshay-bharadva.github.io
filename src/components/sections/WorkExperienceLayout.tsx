import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionLayoutProps } from "./shared";

const WorkExperienceLayout = ({ items }: SectionLayoutProps) => (
  <div className="space-y-0">
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group relative grid grid-cols-[1fr] md:grid-cols-[200px_1fr] gap-6 py-10 border-b border-border/40 last:border-0"
      >
        {/* Left — company + dates */}
        <div className="flex md:flex-col gap-4 md:gap-3">
          <div className="size-12 rounded-xl border border-border/50 bg-card overflow-hidden flex items-center justify-center shrink-0">
            {item.image_url
              ? <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-1.5" />
              : <span className="font-bold text-sm text-muted-foreground">{item.title.slice(0, 2).toUpperCase()}</span>
            }
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">{item.title}</div>
            {(item.date_from || item.date_to) && (
              <div className="font-mono text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="size-3" />
                {item.date_from}{item.date_to && ` – ${item.date_to}`}
              </div>
            )}
          </div>
        </div>

        {/* Right — role + bullets */}
        <div>
          {item.subtitle && (
            <h3 className="text-lg font-bold tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors">
              {item.subtitle}
            </h3>
          )}
          {item.description && (
            <div className="prose prose-sm max-w-none
              text-muted-foreground
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-li:text-muted-foreground prose-li:leading-relaxed
              prose-ul:space-y-1.5 prose-ul:mt-0
              prose-a:text-primary
              [&_ul]:list-none [&_ul]:pl-0
              [&_li]:flex [&_li]:items-start [&_li]:gap-2
              [&_li]:before:content-['→'] [&_li]:before:text-primary/50 [&_li]:before:shrink-0 [&_li]:before:mt-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    ))}
  </div>
);

export default WorkExperienceLayout;
