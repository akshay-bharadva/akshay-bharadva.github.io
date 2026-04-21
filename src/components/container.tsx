import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = PropsWithChildren & { className?: string };

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
