import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { BookUser } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface HeroAboutSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function HeroAboutSection({ form }: HeroAboutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookUser className="size-5 text-primary" /> Hero & About Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="profile_data.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full-Stack Developer." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Description (Markdown)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="profile_data.bio.0"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Bio (Paragraph 1)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.bio.1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Bio (Paragraph 2)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
