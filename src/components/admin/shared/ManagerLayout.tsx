// Unified layout wrapper for all admin manager pages
// Ensures consistent spacing, padding, and structure across all modules

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ManagerLayoutProps {
  /** Main content of the manager */
  children: ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Maximum width constraint */
  maxWidth?: "full" | "7xl" | "6xl" | "5xl";
  /** Enable mobile bottom navigation padding */
  hasMobileNav?: boolean;
}

const maxWidthClasses = {
  full: "",
  "7xl": "max-w-7xl mx-auto",
  "6xl": "max-w-6xl mx-auto",
  "5xl": "max-w-5xl mx-auto",
};

/**
 * ManagerLayout - Consistent wrapper for admin module pages
 *
 * Provides:
 * - Consistent vertical spacing (space-y-6)
 * - Loading state overlay
 * - Mobile bottom navigation offset (pb-20 md:pb-0)
 * - Optional max-width constraint
 *
 * Usage:
 * ```tsx
 * <ManagerLayout isLoading={isLoading} hasMobileNav>
 *   <PageHeader title="..." />
 *   <StatsRow />
 *   <DataTable />
 * </ManagerLayout>
 * ```
 */
export default function ManagerLayout({
  children,
  isLoading = false,
  className,
  maxWidth = "full",
  hasMobileNav = false,
}: ManagerLayoutProps) {
  return (
    <div
      className={cn(
        "space-y-6 relative",
        hasMobileNav && "pb-20 md:pb-0",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * StatsGrid - Consistent grid layout for stat cards
 * Default: 2 columns on mobile, 4 on tablet+
 */
export function StatsGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {children}
    </div>
  );
}

/**
 * ContentCard - Consistent card wrapper for main content areas
 */
export function ContentCard({
  children,
  className,
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border shadow-sm",
        !noPadding && "p-4 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * SectionDivider - Visual separator between sections
 */
export function SectionDivider({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  if (title) {
    return (
      <div className={cn("flex items-center gap-4 py-2", className)}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return <div className={cn("h-px bg-border my-6", className)} />;
}
