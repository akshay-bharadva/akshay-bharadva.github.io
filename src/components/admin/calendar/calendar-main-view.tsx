import React from "react";
import { Loader2 } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { CalendarFilters } from ".";
import { getEventsForDate } from "./utils";
import type { EventType, DayListState } from "./types";

/** The shape returned by toFcEvent */
type FcEvent = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames: string[];
  extendedProps: { originalEvent: EventType };
};

export interface CalendarMainViewProps {
  calendarRef: React.RefObject<FullCalendar | null>;
  isMobile: boolean;
  isLoading: boolean;
  fcEvents: FcEvent[];
  events: EventType[];
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
  onDatesSet: (info: DatesSetArg) => void;
  onEventClick: (info: EventClickArg) => void;
  onSelect: (info: { start: Date; end: Date; allDay: boolean }) => void;
  onDayListOpen: (state: DayListState) => void;
}

export default function CalendarMainView({
  calendarRef,
  isMobile,
  isLoading,
  fcEvents,
  events,
  filters,
  onFiltersChange,
  onDatesSet,
  onEventClick,
  onSelect,
  onDayListOpen,
}: CalendarMainViewProps) {
  return (
    <div className="flex-1 min-w-0 min-h-0 relative flex flex-col">
      {isMobile && (
        <div className="px-3 py-2 border-b border-border bg-card/30 shrink-0">
          <CalendarFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      <div className="gcal-themed flex-1 min-h-0">
        <FullCalendar
          ref={calendarRef as React.RefObject<FullCalendar>}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={
            isMobile
              ? {
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,listWeek",
                }
              : false
          }
          events={fcEvents}
          datesSet={onDatesSet}
          eventClick={onEventClick}
          selectable
          select={onSelect}
          selectMirror
          unselectAuto
          height="100%"
          dayMaxEvents={3}
          moreLinkClick={(info) => {
            const dayEvents = getEventsForDate(events, info.date);
            onDayListOpen({
              open: true,
              date: info.date,
              events: dayEvents,
            });
            return "none";
          }}
          nowIndicator
          weekNumbers={false}
          fixedWeekCount={false}
          eventDisplay="block"
          displayEventTime
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot
          expandRows
          stickyHeaderDates
          dayHeaderFormat={{ weekday: "short" }}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>
    </div>
  );
}
