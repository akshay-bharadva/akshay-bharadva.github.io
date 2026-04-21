// Unified statistic display card for all admin modules
//
// Accepts icons as either a LucideIcon component reference (`icon={Eye}`)
// or a pre-rendered ReactNode (`icon={<Eye className="size-4" />}`).

import { ReactNode, isValidElement } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Card title displayed at the top */
  title: string;
  /** Main value to display (e.g., "$1,234" or "42") */
  value: string | number;
  /** Icon — either a LucideIcon component or a pre-rendered ReactNode */
  icon?: LucideIcon | ReactNode;
  /** Optional help text or sub-value displayed below the main value */
  helpText?: string;
  /** @deprecated Use `helpText` instead. Alias kept for backwards compatibility. */
  subValue?: string;
  /** Trend direction for styling */
  trend?: "up" | "down" | "neutral";
  /** Highlight the card with primary color gradient */
  highlight?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card size variant */
  size?: "default" | "compact";
}

/**
 * Returns true when the icon prop is a component reference (function, class,
 * or forwardRef object) rather than an already-rendered ReactNode (JSX element).
 */
function isIconComponent(
  icon: StatCardProps["icon"],
): icon is LucideIcon {
  // forwardRef returns an object (not a function), so typeof alone is insufficient.
  // Instead, check if it's NOT an already-rendered JSX element.
  return !isValidElement(icon);
}

export default function StatCard({
  title,
  value,
  icon,
  helpText,
  subValue,
  trend,
  highlight = false,
  className,
  size = "default",
}: StatCardProps) {
  const description = helpText ?? subValue;

  const renderIcon = () => {
    if (!icon) return null;

    // Pre-rendered ReactNode (e.g. `<Wallet className="size-4" />`)
    if (!isIconComponent(icon)) {
      return (
        <div
          className={cn(
            "p-2 rounded-full",
            trend === "up"
              ? "text-green-500 bg-green-500/10"
              : trend === "down"
                ? "text-red-500 bg-red-500/10"
                : highlight
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground bg-muted"
          )}
        >
          {icon}
        </div>
      );
    }

    // LucideIcon component reference (e.g. `Eye`)
    const Icon = icon;
    return (
      <div
        className={cn(
          "p-2 rounded-full",
          trend === "up"
            ? "text-green-600 bg-green-500/10"
            : trend === "down"
              ? "text-red-500 bg-red-500/10"
              : highlight
                ? "text-primary bg-primary/10"
                : "text-muted-foreground bg-muted"
        )}
      >
        <Icon className="size-4" />
      </div>
    );
  };

  const renderDescription = () => {
    if (!description) return null;

    return (
      <p
        className={cn(
          "text-xs mt-1 flex items-center gap-1",
          trend === "up"
            ? "text-green-600"
            : trend === "down"
              ? "text-red-500"
              : "text-muted-foreground"
        )}
      >
        {trend === "up" && <TrendingUp className="size-3" />}
        {trend === "down" && <TrendingDown className="size-3" />}
        {description}
      </p>
    );
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        highlight && "bg-gradient-to-br from-primary/5 to-transparent border-primary/20",
        className
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0",
          size === "compact" ? "pb-1 pt-3 px-4" : "pb-2"
        )}
      >
        <CardTitle
          className={cn(
            "font-medium",
            size === "compact" ? "text-xs" : "text-sm",
            highlight ? "text-primary" : "text-muted-foreground"
          )}
        >
          {title}
        </CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent className={cn(size === "compact" && "pb-3 px-4")}>
        <div
          className={cn(
            "font-bold",
            size === "compact" ? "text-xl" : "text-2xl"
          )}
        >
          {value}
        </div>
        {renderDescription()}
      </CardContent>
    </Card>
  );
}
