import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ADMIN_MANAGER } from "@/lib/constants";

interface ManagerWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard wrapper for all admin manager components.
 * Enforces consistent spacing and mobile bottom padding.
 */
export default function ManagerWrapper({
  children,
  className,
}: ManagerWrapperProps) {
  return (
    <div
      className={cn(
        ADMIN_MANAGER.CONTENT_SPACING,
        ADMIN_MANAGER.MOBILE_BOTTOM_PADDING,
        className
      )}
    >
      {children}
    </div>
  );
}
