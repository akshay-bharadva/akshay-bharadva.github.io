import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Footprints } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface FooterSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function FooterSection({ form }: FooterSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="size-5 text-primary" /> Footer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="footer_data.copyright_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Copyright Text (Markdown)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} className="min-h-[60px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
