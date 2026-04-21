import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SectionLayoutProps } from "./shared";

const CaseStudyLayout = ({ items }: SectionLayoutProps) => (
  <div className="space-y-20">
    {items.map((item, index) => (
      <motion.article
        key={item.id}
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="group"
      >
        {/* Hero image */}
        {item.image_url && (
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-secondary/20 mb-8 aspect-[16/7]">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <span className="font-mono text-xs text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {String(index + 1).padStart(2, "0")}
              </span>
              {(item.date_from || item.date_to) && (
                <span className="font-mono text-xs text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  {item.date_from}{item.date_to && ` — ${item.date_to}`}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Left — narrative */}
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-base font-medium text-primary/80 mb-6">{item.subtitle}</p>
            )}

            {/* Process steps */}
            <div className="space-y-6">
              {[
                { step: "01", label: "Problem", color: "text-blue-500 bg-blue-500/10" },
                { step: "02", label: "Approach", color: "text-violet-500 bg-violet-500/10" },
                { step: "03", label: "Outcome", color: "text-emerald-500 bg-emerald-500/10" },
              ].map(({ step, label, color }) => (
                <div key={step} className="flex gap-4">
                  <div className={`shrink-0 font-mono text-[10px] font-semibold px-2 py-1 rounded-md h-fit mt-0.5 ${color}`}>
                    {step}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mb-1">{label}</div>
                    {step === "01" && item.description && (
                      <div className="prose prose-sm max-w-none text-muted-foreground prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-li:text-muted-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown>
                      </div>
                    )}
                    {step === "02" && item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-transparent font-mono text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {step === "03" && item.subtitle && (
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — outcome metrics */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mb-3">Outcomes</div>
            {item.tags && item.tags.map((tag, i) => {
              const [value, ...rest] = tag.split(" ");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="text-3xl font-black tracking-tighter text-foreground mb-0.5">{value}</div>
                  <div className="text-xs text-muted-foreground font-mono">{rest.join(" ")}</div>
                </motion.div>
              );
            })}
            {item.link_url && (
              <Link href={item.link_url} target="_blank"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-2">
                View live project <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </motion.article>
    ))}
  </div>
);

export default CaseStudyLayout;
