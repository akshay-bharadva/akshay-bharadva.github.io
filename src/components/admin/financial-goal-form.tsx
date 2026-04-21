import { FormEvent } from "react";
import type { FinancialGoal } from "@/types";
import { useSaveGoalMutation } from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required."),
  description: z.string().optional(),
  target_amount: z.coerce.number().positive("Target amount must be positive."),
  target_date: z.string().optional(),
  image_url: z.string().optional(),
});
type GoalFormValues = z.infer<typeof goalSchema>;

interface FinancialGoalFormProps {
  goal: Partial<FinancialGoal> | null;
  onSuccess: () => void;
}

export default function FinancialGoalForm({
  goal,
  onSuccess,
}: FinancialGoalFormProps) {
  const [saveGoal, { isLoading }] = useSaveGoalMutation();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || "",
      description: goal?.description || "",
      target_amount: goal?.target_amount || 0,
      target_date: goal?.target_date || "",
    },
  });

  const handleSubmit = async (values: GoalFormValues) => {
    try {
      await saveGoal({ ...values, id: goal?.id }).unwrap();
      toast.success(`Goal "${values.name}" saved successfully.`);
      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to save goal", { description: getErrorMessage(err) });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount *</FormLabel>
                <FormControl>
                  <Input type="number" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(parseLocalDate(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? parseLocalDate(field.value) : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Vision Board Image URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <p className="text-[10px] text-muted-foreground">
                  Paste a link from your Asset Manager.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {goal?.id ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}