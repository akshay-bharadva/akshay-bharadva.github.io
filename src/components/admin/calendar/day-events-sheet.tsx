import React from "react";
import { format } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronRight, X } from "lucide-react";
import BadgeTypeIcon from "./badge-type-icon";
import type { EventType, DayListState, ViewEventState } from "./types";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface DayEventsDrawerProps {
  state: DayListState;
  onClose: () => void;
  onViewEvent: (state: ViewEventState) => void;
}

export default function DayEventsSheet({
  state,
  onClose,
  onViewEvent,
}: DayEventsDrawerProps) {
  const handleEventClick = (event: EventType) => {
    onClose();
    setTimeout(() => {
      onViewEvent({ open: true, event });
    }, 100);
  };

  return (
    <Sheet open={state.open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-normal">
                  {state.date ? format(state.date, "EEEE") : ""}
                </span>
                <span>{state.date ? format(state.date, "MMM do") : ""}</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {state.events.map((event, i) => (
              <div
                key={i}
                onClick={() => handleEventClick(event)}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
