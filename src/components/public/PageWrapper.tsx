import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PUBLIC_LAYOUT } from "@/lib/constants";
import { motion } from "framer-motion";

interface PageWrapperProps {
  children: ReactNode;
  maxWidth?: keyof typeof PUBLIC_LAYOUT.MAX_WIDTH;
  spacing?: keyof typeof PUBLIC_LAYOUT.SECTION_SPACING;
  animate?: boolean;
  className?: string;
}

/**
 * Standard wrapper for all public-facing pages.
 * Enforces consistent spacing, max-widths, and optional animations.
 */
export default function PageWrapper({
  children,
  maxWidth = "default",
  spacing = "default",
  animate = true,
  className,
}: PageWrapperProps) {
  const containerClasses = cn(
    "py-12 md:py-16 lg:py-20",
    PUBLIC_LAYOUT.MAX_WIDTH[maxWidth],
    PUBLIC_LAYOUT.SECTION_SPACING[spacing],
    "mx-auto",
    className
  );

  if (!animate) {
    return <div className={containerClasses}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={containerClasses}
    >
      {children}
    </motion.div>
  );
}
