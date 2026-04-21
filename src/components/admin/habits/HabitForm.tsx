import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Habit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, Loader2 } from "lucide-react";
import { useSaveHabitMutation } from "@/store/api/adminApi";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const habitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  color: z.string().min(1),
  target_per_week: z.coerce.number().min(1).max(7),
});

type FormValues = z.infer<typeof habitSchema>;

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
];

export default function HabitForm({
  habit,
  onSuccess,
}: {
  habit: Partial<Habit> | null;
  onSuccess: () => void;
}) {
  const [saveHabit, { isLoading }] = useSaveHabitMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: habit?.title || "",
      color: habit?.color || "#3b82f6",
      target_per_week: habit?.target_per_week || 7,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await saveHabit({ id: habit?.id, ...values, is_active: true }).unwrap();
      toast.success("Habit saved successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to save habit");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Read 30 mins" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Code</FormLabel>
              <FormControl>
                <div className="flex gap-3 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="size-10 rounded-full border-2 shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 ring-offset-2 ring-primary"
                        style={{
                          backgroundColor: field.value,
                          borderColor: field.value,
                        }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid grid-cols-4 gap-2">
                        {COLORS.map((c) => (
                          <div
                            key={c}
                            onClick={() => field.onChange(c)}
                            className={cn(
                              "size-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all hover:scale-110",
                              field.value === c
                                ? "border-foreground"
                                : "border-transparent",
                            )}
                            style={{ backgroundColor: c }}
                          >
                            {field.value === c && (
                              <Check className="size-4 text-white drop-shadow-md" />
                            )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    {...field}
                    className="w-32 font-mono uppercase"
                    placeholder="#000000"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_per_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Target (Days)</FormLabel>
              <FormControl>
                <Input type="number" {...field} min={1} max={7} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Habit
          </Button>
        </div>
      </form>
    </Form>
  );
}
