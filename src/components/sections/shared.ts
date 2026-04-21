import { PortfolioItem } from "@/types";

export interface SectionLayoutProps {
  items: PortfolioItem[];
}

export const cardItemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
