import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export default function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  side = "right",
}: FormSheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <ScrollArea className="flex-1 overflow-auto">
            <div className={cn("px-4 pb-4", className)}>{children}</div>
          </ScrollArea>
          {footer && (
            <div className="border-t p-4 mt-auto bg-background">{footer}</div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col sm:max-w-lg",
          side === "right" && "w-full"
        )}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className={cn("py-4", className)}>{children}</div>
        </ScrollArea>
        {footer && (
          <div className="border-t -mx-6 px-6 pt-4 mt-auto">{footer}</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
