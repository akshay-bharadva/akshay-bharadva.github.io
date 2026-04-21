import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import EventDetailsContent from "./event-details-content";
import type { EventType, ViewEventState } from "./types";

export interface ResponsiveEventDetailsProps {
  state: ViewEventState;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onNavigate: (tab: string) => void;
}

export default function ResponsiveEventDetails({
  state,
  onClose,
  onEdit,
  onDelete,
  onNavigate,
}: ResponsiveEventDetailsProps) {
  const isMobile = useIsMobile();

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  // Mobile: Use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={state.open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Event Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pt-0">
            {state.event && (
              <EventDetailsContent
                event={state.event}
                onEdit={onEdit}
                onNavigate={onNavigate}
                onDelete={state.event.type === "event" ? onDelete : undefined}
              />
            )}
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet (side panel)
  return (
    <Sheet open={state.open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Event Details</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {state.event && (
            <EventDetailsContent
              event={state.event}
              onEdit={onEdit}
              onNavigate={onNavigate}
              onDelete={state.event.type === "event" ? onDelete : undefined}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
