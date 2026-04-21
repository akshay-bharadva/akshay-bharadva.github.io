import { FormEvent } from "react";
import type { Transaction } from "@/types";
import { useSaveTransactionMutation } from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combobox";
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
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";

const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["earning", "expense"]),
  category: z.string().optional(),
});
type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction: Partial<Transaction> | null;
  onSuccess: () => void;
  categories: string[];
}

export default function TransactionForm({
  transaction,
  onSuccess,
  categories,
}: TransactionFormProps) {
  const [saveTransaction, { isLoading }] = useSaveTransactionMutation();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction?.date || new Date().toISOString().split("T")[0],
      description: transaction?.description || "",
      amount: transaction?.amount || 0,
      type: transaction?.type || "expense",
      category: transaction?.category || "",
    },
  });

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      await saveTransaction({
        ...values,
        id: transaction?.id,
        category: values.category || null,
      }).unwrap();
      toast.success(`Transaction "${values.description}" saved.`);
      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to save transaction", { description: getErrorMessage(err) });
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Combobox
                  options={categoryOptions}
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Select or create a category..."
                  searchPlaceholder="Search categories..."
                  emptyPlaceholder="No categories found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center gap-4 pt-2"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="earning" />
                    </FormControl>
                    <FormLabel className="font-normal">Earning</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {transaction?.id ? "Save Changes" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}