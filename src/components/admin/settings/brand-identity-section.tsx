import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Fingerprint } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface BrandIdentitySectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function BrandIdentitySection({
  form,
}: BrandIdentitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-5 text-primary" /> Brand Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="profile_data.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="profile_data.logo.main"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Main Text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="FOLIO" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile_data.logo.highlight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Highlight</FormLabel>
                <FormControl>
                  <Input {...field} placeholder=".DEV" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="profile_data.profile_picture_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile_data.show_profile_picture"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Show Profile Picture</FormLabel>
                <FormDescription>
                  Display avatar on "About" page.
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
