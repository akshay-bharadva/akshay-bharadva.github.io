import React from "react";
import { format } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import BadgeTypeIcon from "./badge-type-icon";
import type { EventType, DayListState, ViewEventState } from "./types";

export interface ResponsiveDayEventsProps {
  state: DayListState;
  onClose: () => void;
  onViewEvent: (state: ViewEventState) => void;
}

// Shared event list content
function EventListContent({
  events,
  onEventClick,
}: {
  events: EventType[];
  onEventClick: (event: EventType) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {events.map((event, i) => (
        <div
          key={i}
          onClick={() => onEventClick(event)}
          className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <BadgeTypeIcon type={event.type} />
            <div className="flex-1">
              <div className="font-semibold text-sm">{event.title}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {event.type.replace("_", " ")}
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Format date header
function DateHeader({ date }: { date: Date | null }) {
  if (!date) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground font-normal">
        {format(date, "EEEE")}
      </span>
      <span>{format(date, "MMM do")}</span>
    </div>
  );
}

export default function ResponsiveDayEvents({
  state,
  onClose,
  onViewEvent,
}: ResponsiveDayEventsProps) {
  const isMobile = useIsMobile();

  const handleEventClick = (event: EventType) => {
    onClose();
    setTimeout(() => {
      onViewEvent({ open: true, event });
    }, 100);
  };

  // Mobile: Use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={state.open} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left border-b pb-4">
            <DrawerTitle>
              <DateHeader date={state.date} />
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <EventListContent
              events={state.events}
              onEventClick={handleEventClick}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet (side panel)
  return (
    <Sheet open={state.open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              <DateHeader date={state.date} />
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <div className="p-4 overflow-y-auto">
          <EventListContent
            events={state.events}
            onEventClick={handleEventClick}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
