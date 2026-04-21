import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import { getErrorMessage } from "@/lib/utils";
import { projectRecurringOccurrences } from "@/lib/finance-utils";
import {
  useGetCalendarDataQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/store/api/adminApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { ManagerWrapper } from "./shared";

import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";

import {
  mapItemToEvent,
  toFcEvent,
  CalendarTopBar,
  CalendarSidebar,
  CalendarMainView,
  EventFormSheet,
  ResponsiveDayEvents,
  ResponsiveEventDetails,
  type EventType,
  type EventFormData,
  type SheetState,
  type ViewEventState,
  type DayListState,
} from "./calendar";

export default function CommandCalendar({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const confirm = useConfirm();
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useIsMobile();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState("dayGridMonth");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [filters, setFilters] = useState<string[]>([
    "event",
    "task",
    "transaction_summary",
    "forecast",
    "habit_summary",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data, isLoading, error } = useGetCalendarDataQuery(
    dateRange ?? skipToken
  );
  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [sheetState, setSheetState] = useState<SheetState>({
    open: false,
    isNew: false,
  });
  const [viewEventState, setViewEventState] = useState<ViewEventState>({
    open: false,
    event: null,
  });
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    id: "",
    title: "",
    description: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    is_all_day: false,
  });
  const [dayListState, setDayListState] = useState<DayListState>({
    open: false,
    date: null,
    events: [],
  });

  useEffect(() => {
    if (error)
      toast.error("Failed to load calendar data", {
        description: error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : "Unknown error",
      });
  }, [error]);

  const handleDatesSet = useCallback((info: DatesSetArg) => {
    setCurrentDate(info.view.currentStart);
    setActiveView(info.view.type);
    setDateRange({
      start: info.start.toISOString(),
      end: info.end.toISOString(),
    });
  }, []);

  // Forecasting logic
  const events = useMemo(() => {
    if (!data) return [];

    const baseEvents = data.baseEvents.map(mapItemToEvent);

    const today = startOfDay(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const viewStart = startOfDay(new Date(year, month - 1, 1));
    const viewEnd = endOfDay(new Date(year, month + 2, 0));

    const projectionStart = isAfter(today, viewStart) ? today : viewStart;

    const forecastEvents: EventType[] = projectRecurringOccurrences(
      data.recurring ?? [],
      projectionStart,
      viewEnd,
    ).map(({ rule, date }) => ({
      id: `forecast-${rule.id}-${date.getTime()}`,
      title: rule.description,
      start: date,
      allDay: true,
      type: "forecast",
      amount: rule.amount,
      transactionType: rule.type,
    }));

    let filtered = [...baseEvents, ...forecastEvents].filter((event) =>
      filters.includes(event.type)
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(q));
    }

    return filtered;
  }, [data, filters, currentDate, searchQuery]);

  const fcEvents = useMemo(() => events.map(toFcEvent), [events]);

  // --- Handlers ---

  const handleEventClick = useCallback((info: EventClickArg) => {
    const original = info.event.extendedProps.originalEvent as EventType;
    setViewEventState({ open: true, event: original });
  }, []);

  const handleSelect = useCallback(
    (info: { start: Date; end: Date; allDay: boolean }) => {
      let endDate = info.end;
      if (info.allDay) {
        endDate = new Date(info.end);
        endDate.setDate(endDate.getDate() - 1);
      }
      setEventFormData({
        id: "",
        title: "",
        description: "",
        start_time: info.start.toISOString(),
        end_time: endDate.toISOString(),
        is_all_day: info.allDay,
      });
      setSheetState({ open: true, isNew: true });
    },
    []
  );

  const handleAddNewEvent = () => {
    const base = selectedDate || new Date();
    setEventFormData({
      id: "",
      title: "",
      description: "",
      start_time: base.toISOString(),
      end_time: base.toISOString(),
      is_all_day: false,
    });
    setSheetState({ open: true, isNew: true });
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      const now = new Date();
      setSelectedDate(now);
      setCurrentDate(now);
    }
  };

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setSelectedDate(api.getDate());
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setSelectedDate(api.getDate());
    }
  };

  const handleChangeView = (viewKey: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(viewKey);
      setActiveView(viewKey);
    }
  };

  const handleMiniCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setCurrentDate(date);
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(date);
  };

  const handleMiniCalendarMonthChange = (month: Date) => {
    const api = calendarRef.current?.getApi();
    if (api) api.gotoDate(month);
  };

  const toggleFilter = (key: string) => {
    setFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave: Record<string, unknown> = {
      title: eventFormData.title,
      description: eventFormData.description || null,
      start_time: eventFormData.start_time,
      end_time: eventFormData.end_time || null,
      is_all_day: eventFormData.is_all_day,
    };

    if (eventFormData.id && eventFormData.id.trim() !== "") {
      dataToSave.id = eventFormData.id;
    }

    try {
      if (sheetState.isNew) {
        await addEvent(dataToSave).unwrap();
      } else {
        await updateEvent(dataToSave).unwrap();
      }
      toast.success(
        `Event ${sheetState.isNew ? "created" : "updated"} successfully.`
      );
      setSheetState({ open: false, isNew: false });
    } catch (err: unknown) {
      toast.error("Failed to save event", { description: getErrorMessage(err) });
    }
  };

  const handleDeleteEvent = async (id?: string) => {
    const targetId = id || eventFormData.id;
    if (!targetId) return;

    const isConfirmed = await confirm({
      title: "Delete Event?",
      description: "Are you sure you want to delete this event?",
      variant: "destructive",
      confirmText: "Delete",
    });

    if (!isConfirmed) return;

    try {
      await deleteEvent(targetId).unwrap();
      toast.success("Event deleted.");
      setSheetState({ open: false, isNew: false });
      setViewEventState({ open: false, event: null });
    } catch (err: unknown) {
      toast.error("Failed to delete event", { description: getErrorMessage(err) });
    }
  };

  const handleEditClick = () => {
    const eventToEdit = viewEventState.event;
    if (!eventToEdit) return;

    setEventFormData({
      id: eventToEdit.id,
      title: eventToEdit.title,
      description: eventToEdit.description || "",
      start_time: eventToEdit.start.toISOString(),
      end_time:
        eventToEdit.end?.toISOString() || eventToEdit.start.toISOString(),
      is_all_day: eventToEdit.allDay,
    });
    setViewEventState({ open: false, event: null });
    setSheetState({ open: true, isNew: false });
  };

  return (
    <ManagerWrapper className="!space-y-0 !pb-0 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 -mb-20 lg:-mb-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Bar */}
      <CalendarTopBar
        currentDate={currentDate}
        activeView={activeView}
        searchQuery={searchQuery}
        showSearch={showSearch}
        onSearchQueryChange={setSearchQuery}
        onShowSearchChange={setShowSearch}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        onChangeView={handleChangeView}
        onAddNewEvent={handleAddNewEvent}
      />

      {/* Body: Sidebar + Calendar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isMobile && (
          <CalendarSidebar
            currentDate={currentDate}
            selectedDate={selectedDate}
            filters={filters}
            events={events}
            onMiniCalendarSelect={handleMiniCalendarSelect}
            onMiniCalendarMonthChange={handleMiniCalendarMonthChange}
            onToggleFilter={toggleFilter}
            onViewEvent={setViewEventState}
          />
        )}

        <CalendarMainView
          calendarRef={calendarRef}
          isMobile={isMobile}
          isLoading={isLoading}
          fcEvents={fcEvents}
          events={events}
          filters={filters}
          onFiltersChange={setFilters}
          onDatesSet={handleDatesSet}
          onEventClick={handleEventClick}
          onSelect={handleSelect}
          onDayListOpen={setDayListState}
        />
      </div>

      {/* Overlays */}
      <ResponsiveEventDetails
        state={viewEventState}
        onClose={() => setViewEventState({ open: false, event: null })}
        onEdit={handleEditClick}
        onDelete={() => handleDeleteEvent(viewEventState.event?.id)}
        onNavigate={onNavigate}
      />

      <EventFormSheet
        sheetState={sheetState}
        formData={eventFormData}
        onFormDataChange={setEventFormData}
        onClose={() => setSheetState({ ...sheetState, open: false })}
        onSubmit={handleEventFormSubmit}
        onDelete={() => handleDeleteEvent()}
      />

      <ResponsiveDayEvents
        state={dayListState}
        onClose={() => setDayListState({ ...dayListState, open: false })}
        onViewEvent={setViewEventState}
      />
    </ManagerWrapper>
  );
}
