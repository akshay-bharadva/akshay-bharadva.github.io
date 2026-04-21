import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  useAddInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from "@/store/api/adminApi";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import { format } from "date-fns";

const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serial_number: z.string().optional(),
  purchase_price: z.coerce.number().min(0),
  current_value: z.coerce.number().optional(),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  notes: z.string().optional(),
  image_url: z.string().optional(),
});

type FormValues = z.infer<typeof inventorySchema>;

const CATEGORIES = [
  { label: "Hardware", value: "Hardware" },
  { label: "Software", value: "Software" },
  { label: "Furniture", value: "Furniture" },
  { label: "Accessory", value: "Accessory" },
  { label: "Other", value: "Other" },
];

export default function InventoryForm({
  item,
  onSuccess,
}: {
  item: InventoryItem | null;
  onSuccess: () => void;
}) {
  const [addItem, { isLoading: isAdding }] = useAddInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateInventoryItemMutation();
  const isLoading = isAdding || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: item?.name || "",
      category: item?.category || "",
      serial_number: item?.serial_number || "",
      purchase_price: item?.purchase_price || 0,
      current_value: item?.current_value || item?.purchase_price || 0,
      purchase_date: item?.purchase_date || "",
      warranty_expiry: item?.warranty_expiry || "",
      notes: item?.notes || "",
      image_url: item?.image_url || "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        current_value: values.current_value || values.purchase_price,
        purchase_date: values.purchase_date || null,
        warranty_expiry: values.warranty_expiry || null,
      };

      if (item) {
        await updateItem({ id: item.id, ...payload }).unwrap();
        toast.success("Item updated");
      } else {
        await addItem(payload).unwrap();
        toast.success("Item added");
      }
      onSuccess();
    } catch (error: unknown) {
      toast.error("Failed to save item", { description: getErrorMessage(error) });
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
              <FormLabel>Item Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. MacBook Pro M3" autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <FormControl>
                  <Combobox
                    options={CATEGORIES}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select category"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial / License Key</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
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
            name="warranty_expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warranty Expiry</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Condition, location, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Link from Asset Manager..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {item ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}