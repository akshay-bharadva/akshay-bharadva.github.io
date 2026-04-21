import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PanelRightOpen } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface StatusPanelSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function StatusPanelSection({ form }: StatusPanelSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PanelRightOpen className="size-5 text-primary" /> Hero Status Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="profile_data.status_panel.show"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Show Status Panel</FormLabel>
                <FormDescription>
                  Toggle the HUD on the homepage.
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
          name="profile_data.status_panel.design"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? "minimal"}
                value={field.value ?? "minimal"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="minimal">Minimal — editorial card</SelectItem>
                  <SelectItem value="terminal">Terminal — monospace prompt</SelectItem>
                  <SelectItem value="bento">Bento — flat tile grid</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pick which style renders on the homepage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.status_panel.availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.status_panel.currently_exploring.items.0"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exploring #1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.status_panel.currently_exploring.items.1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exploring #2</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Separator />
        <FormField
          control={form.control}
          name="profile_data.status_panel.latestProject.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latest Project Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.status_panel.latestProject.href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latest Project URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="/projects" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
