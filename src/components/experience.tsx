import Link from "next/link";
import { PropsWithChildren } from "react";
import { ArrowUpRight, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useGetSectionsByPathQuery } from "@/store/api/publicApi";
import { PortfolioItem } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { siteContent } from "@/lib/site-content";

type ExperienceProps = PropsWithChildren<{
  showTitle?: boolean;
}>;

export default function Experience({
  children,
  showTitle = true,
}: ExperienceProps) {
  const { data: sections, isLoading, error } = useGetSectionsByPathQuery("/");
  const experienceSection = sections?.find((s) => s.title === "Experience");
  const experienceItems: PortfolioItem[] =
    (experienceSection?.portfolio_items as PortfolioItem[]) || [];

  return (
    <section className="py-16 relative">
      {showTitle && (
        <motion.div
          className="mb-16 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold font-mono tracking-tight text-foreground">
            <span className="text-primary">02.</span>{" "}
            {siteContent.experience.mainTitle}
          </h2>
          <div className="h-px flex-grow bg-border/50" />
        </motion.div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary/50" />
        </div>
      )}

      {!isLoading && experienceItems.length > 0 && (
        <div className="relative border-l border-border ml-3 md:ml-6 space-y-12">
          {experienceItems.map((exp, index) => (
            <motion.div
              key={exp.id}
              className="relative pl-8 md:pl-12"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-primary ring-4 ring-background" />

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-foreground">
                  {exp.title}
                  {exp.link_url && (
                    <Link
                      href={exp.link_url}
                      target="_blank"
                      className="inline-block ml-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  )}
                </h3>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                  <Calendar className="size-3" />
                  {exp.date_from} — {exp.date_to}
                </div>
              </div>

              <div className="text-lg font-medium text-primary mb-4">
                {exp.subtitle}
              </div>

              {exp.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-6 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {exp.description}
                  </ReactMarkdown>
                </div>
              )}

              {exp.tags && exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="font-mono text-xs border-primary/20 text-primary/80"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {children && <div className="mt-16">{children}</div>}
    </section>
  );
}
