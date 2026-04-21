import { PortfolioSection } from "@/types";
import Projects from "@/components/projects";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";

import TimelineLayout from "./sections/TimelineLayout";
import Grid2ColLayout from "./sections/Grid2ColLayout";
import Grid3ColLayout from "./sections/Grid3ColLayout";
import CardsWithImageLayout from "./sections/CardsWithImageLayout";
import CompactCardsLayout from "./sections/CompactCardsLayout";
import StatsGridLayout from "./sections/StatsGridLayout";
import MasonryLayout from "./sections/MasonryLayout";
import FeatureAlternatingLayout from "./sections/FeatureAlternatingLayout";
import DefaultListLayout from "./sections/DefaultListLayout";
import CaseStudyLayout from "./sections/CaseStudyLayout";
import ServicesLayout from "./sections/ServicesLayout";
import WorkExperienceLayout from "./sections/WorkExperienceLayout";
import TestimonialsLayout from "./sections/TestimonialsLayout";
import ImpactNumbersLayout from "./sections/ImpactNumbersLayout";
import OpenSourceLayout from "./sections/OpenSourceLayout";
import SpeakingLayout from "./sections/SpeakingLayout";
import PressAwardsLayout from "./sections/PressAwardsLayout";
import ClientLogosLayout from "./sections/ClientLogosLayout";
import NowPageLayout from "./sections/NowPageLayout";
import UsesLayout from "./sections/UsesLayout";

interface SectionRendererProps {
  section: PortfolioSection;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const { title, layout_style, type, content, portfolio_items } = section;
  const items = portfolio_items || [];

  const renderContent = () => {
    switch (layout_style) {
      case "timeline":            return <TimelineLayout items={items} />;
      case "grid-2-col":          return <Grid2ColLayout items={items} />;
      case "grid-3-col":          return <Grid3ColLayout items={items} />;
      case "cards-with-image":    return <CardsWithImageLayout items={items} />;
      case "compact-cards":       return <CompactCardsLayout items={items} />;
      case "stats-grid":          return <StatsGridLayout items={items} />;
      case "masonry":             return <MasonryLayout items={items} />;
      case "feature-alternating": return <FeatureAlternatingLayout items={items} />;
      case "github-grid":         return <Projects showTitle={false} />;
      case "case-study":          return <CaseStudyLayout items={items} />;
      case "services":            return <ServicesLayout items={items} />;
      case "work-experience":     return <WorkExperienceLayout items={items} />;
      case "testimonials":        return <TestimonialsLayout items={items} />;
      case "impact-numbers":      return <ImpactNumbersLayout items={items} />;
      case "open-source":         return <OpenSourceLayout items={items} />;
      case "speaking":            return <SpeakingLayout items={items} />;
      case "press-awards":        return <PressAwardsLayout items={items} />;
      case "client-logos":        return <ClientLogosLayout items={items} />;
      case "now-page":            return <NowPageLayout items={items} />;
      case "uses":                return <UsesLayout items={items} />;
      case "default":
      default:
        if (type === "list_items") return <DefaultListLayout items={items} />;
        if (type === "markdown" && content) {
          return (
            <div className="prose prose-lg max-w-3xl mx-auto
              prose-headings:font-mono prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline
              prose-blockquote:border-l-primary prose-blockquote:bg-secondary/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-strong:text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <motion.section
      className="py-12 md:py-16 relative"
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="mb-12 flex items-center gap-6 relative z-10">
        <div className="flex items-center gap-3 shrink-0">
          <Hash className="size-5 text-primary" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground">{title}</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-border to-transparent" />
      </div>
      <div className="relative z-10">{renderContent()}</div>
    </motion.section>
  );
}
