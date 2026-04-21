import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { MessageSquare } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface ContactPageSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function ContactPageSection({ form }: ContactPageSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" /> Contact Page
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="profile_data.contact_page.show_contact_form"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Contact Form</FormLabel>
                <FormDescription>
                  Show the message form on the contact page.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.contact_page.show_availability_badge"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Availability Badge</FormLabel>
                <FormDescription>
                  Show the &quot;Available for work&quot; status indicator.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.contact_page.show_services"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Services Section</FormLabel>
                <FormDescription>
                  Show services below the contact info.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
