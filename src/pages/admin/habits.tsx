import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useGetHabitsQuery,
  useDeleteHabitMutation,
  useToggleHabitLogMutation,
} from "@/store/api/adminApi";
import HabitGrid from "@/components/admin/habits/HabitGrid";
import HabitForm from "@/components/admin/habits/HabitForm";
import HabitStats from "@/components/admin/habits/HabitStats";
import HabitHeatmapModal from "@/components/admin/habits/HabitHeatmapModal";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Habit } from "@/types";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { PerfectDayBadge } from "@/components/admin/habits/PerfectDayBadge";

export default function AdminHabitsPage() {
  const { isLoading } = useAuthGuard();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitForStats, setSelectedHabitForStats] =
    useState<Habit | null>(null);

  const { data: habits = [], isLoading: isDataLoading } = useGetHabitsQuery();
  const [toggleLog] = useToggleHabitLogMutation();
  const [deleteHabit] = useDeleteHabitMutation();
  const confirm = useConfirm();

  const handleToggle = async (habitId: string, date: string) => {
    try {
      await toggleLog({ habit_id: habitId, date }).unwrap();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Habit?",
      description: "This will remove the habit and all history forever.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteHabit(id).unwrap();
      toast.success("Habit deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const openCreate = () => {
    setEditingHabit(null);
    setIsSheetOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsSheetOpen(true);
  };

  if (isLoading)
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );

  return (
    <AdminLayout title="Habit Tracker">
      <div className="space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              Habit Tracker
            </h2>
            <p className="text-muted-foreground text-sm hidden sm:block">
              Level up your life, one day at a time.
            </p>
          </div>
          <div className="flex justify-center sm:my-0">
            <PerfectDayBadge habits={habits} />
          </div>
          <Button
            onClick={openCreate}
            size="sm"
            className="w-full sm:w-auto shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 size-4" /> New Habit
          </Button>
        </div>

        {/* 1. Gamified Stats */}
        {!isDataLoading && habits.length > 0 && <HabitStats habits={habits} />}

        {/* 2. Main Grid */}
        {isDataLoading ? (
          <LoadingSpinner />
        ) : (
          <HabitGrid
            habits={habits}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={openEdit}
            onViewStats={setSelectedHabitForStats}
          />
        )}

        {/* Forms & Modals */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <div className="flex justify-between items-center">
              <SheetHeader>
                <SheetTitle>
                  {editingHabit ? "Edit Habit" : "Create New Habit"}
                </SheetTitle>
              </SheetHeader>
              <SheetClose asChild>
                <Button type="button" variant="ghost">
                  <X />
                </Button>
              </SheetClose>
            </div>
            <HabitForm
              habit={editingHabit}
              onSuccess={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <HabitHeatmapModal
          habit={selectedHabitForStats}
          isOpen={!!selectedHabitForStats}
          onClose={() => setSelectedHabitForStats(null)}
        />
      </div>
    </AdminLayout>
  );
}
