import React from "react";
import { format, setHours, setMinutes, startOfDay } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventFormData, SheetState } from "./types";

export interface EventFormSheetProps {
  sheetState: SheetState;
  formData: EventFormData;
  onFormDataChange: (data: EventFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
}

export default function EventFormSheet({
  sheetState,
  formData,
  onFormDataChange,
  onClose,
  onSubmit,
  onDelete,
}: EventFormSheetProps) {
  const updateDateTime = (
    field: "start_time" | "end_time",
    newDate: Date | undefined,
    newTimeStr?: string
  ) => {
    if (!newDate) return;

    let updatedDate = newDate;

    if (newTimeStr) {
      const [hours, minutes] = newTimeStr.split(":").map(Number);
      updatedDate = setMinutes(setHours(newDate, hours), minutes);
    } else if (formData.is_all_day) {
      updatedDate = startOfDay(newDate);
    } else {
      const oldDate = new Date(formData[field]);
      updatedDate = setMinutes(
        setHours(newDate, oldDate.getHours()),
        oldDate.getMinutes()
      );
    }

    onFormDataChange({
      ...formData,
      [field]: updatedDate.toISOString(),
    });
  };

  return (
    <Sheet open={sheetState.open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              {sheetState.isNew ? "Create New Event" : "Edit Event"}
            </SheetTitle>
            <SheetDescription>
              {sheetState.isNew
                ? "Add a new event to your calendar."
                : "Update existing event details."}
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
        <div className="flex-1 flex flex-col justify-between mt-4">
          <ScrollArea className="h-full pr-6 -mr-6">
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, title: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md bg-secondary/20">
                <Switch
                  id="is_all_day"
                  checked={formData.is_all_day}
                  onCheckedChange={(c) =>
                    onFormDataChange({ ...formData, is_all_day: c })
                  }
                />
                <Label
                  htmlFor="is_all_day"
                  className="cursor-pointer font-medium"
                >
                  All-day event
                </Label>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Start</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !formData.start_time && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_time ? (
                            format(new Date(formData.start_time), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(formData.start_time)}
                          onSelect={(date) => updateDateTime("start_time", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {!formData.is_all_day && (
                      <Input
                        type="time"
                        className="w-32"
                        value={format(new Date(formData.start_time), "HH:mm")}
                        onChange={(e) =>
                          updateDateTime(
                            "start_time",
                            new Date(formData.start_time),
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !formData.end_time && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.end_time ? (
                            format(new Date(formData.end_time), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(formData.end_time)}
                          onSelect={(date) => updateDateTime("end_time", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {!formData.is_all_day && (
                      <Input
                        type="time"
                        className="w-32"
                        value={format(new Date(formData.end_time), "HH:mm")}
                        onChange={(e) =>
                          updateDateTime(
                            "end_time",
                            new Date(formData.end_time),
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t mt-4">
            {!sheetState.isNew && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="w-full sm:w-auto sm:mr-auto"
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onSubmit}>
                {sheetState.isNew ? "Create" : "Save"}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
