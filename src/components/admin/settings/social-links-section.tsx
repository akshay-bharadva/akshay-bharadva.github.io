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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link as LinkIcon } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface SocialLinksSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function SocialLinksSection({ form }: SocialLinksSectionProps) {
  const socialLinks = form.getValues("social_links");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="size-5 text-primary" /> Social Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialLinks.map((link, index) => (
          <div
            key={link.id}
            className="space-y-2 border rounded-md p-2 bg-secondary/5"
          >
            <div className="flex items-center justify-between">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {link.label}
              </FormLabel>
              <FormField
                control={form.control}
                name={`social_links.${index}.is_visible`}
                render={({ field: switchField }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={switchField.value}
                        onCheckedChange={switchField.onChange}
                        className="scale-75"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name={`social_links.${index}.url`}
              render={({ field: urlField }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...urlField}
                      placeholder={`Enter ${link.label} URL`}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
