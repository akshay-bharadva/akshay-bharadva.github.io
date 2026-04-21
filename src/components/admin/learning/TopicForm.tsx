import { FormEvent } from "react";
import type { LearningTopic, LearningSubject } from "@/types";
import { useSaveTopicMutation } from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

const topicSchema = z.object({
  title: z.string().min(1, "Topic title is required."),
  subject_id: z.string().min(1, "You must select a subject."),
});
type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicFormProps {
  topic: Partial<LearningTopic> | null;
  subjects: LearningSubject[];
  defaultSubjectId?: string;
  onSuccess: () => void;
}

export default function TopicForm({
  topic,
  subjects,
  defaultSubjectId,
  onSuccess,
}: TopicFormProps) {
  const [saveTopic, { isLoading }] = useSaveTopicMutation();
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: topic?.title || "",
      subject_id: topic?.subject_id || defaultSubjectId || "",
    },
  });

  const handleSubmit = async (values: TopicFormValues) => {
    try {
      await saveTopic({ ...values, id: topic?.id }).unwrap();
      toast.success(`Topic "${values.title}" saved successfully.`);
      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to save topic", { description: getErrorMessage(err) });
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
              <FormLabel>Topic Title *</FormLabel>
              <FormControl>
                <Input {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {topic?.id ? "Save Changes" : "Create Topic"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
