import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette } from "lucide-react";
import { THEME_PRESETS } from "@/lib/constants";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface ThemeSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

const CUSTOM_COLOR_KEYS = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "accent",
  "card",
] as const;

export default function ThemeSection({ form }: ThemeSectionProps) {
  const watchTheme = form.watch("profile_data.default_theme");
  const isCustomTheme = watchTheme === "theme-custom";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="size-5 text-primary" /> Theme Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <FormField
              control={form.control}
              name="profile_data.default_theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Preset</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64">
                      {THEME_PRESETS.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Uses a pre-defined color palette.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 bg-secondary/30">
              <Label
                className="cursor-pointer text-sm"
                onClick={() =>
                  form.setValue("profile_data.default_theme", "theme-custom")
                }
              >
                Enable Custom Theme
              </Label>
              <Switch
                checked={isCustomTheme}
                onCheckedChange={(checked) =>
                  form.setValue(
                    "profile_data.default_theme",
                    checked ? "theme-custom" : "theme-blueprint"
                  )
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CUSTOM_COLOR_KEYS.map((colorKey) => (
                <FormField
                  key={colorKey}
                  control={form.control}
                  name={`profile_data.custom_theme_colors.${colorKey}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize text-xs">
                        {colorKey}
                      </FormLabel>
                      <div className="flex gap-2 items-center">
                        <div className="relative w-8 h-8 rounded-md border overflow-hidden shrink-0">
                          <input
                            type="color"
                            className="absolute inset-0 w-12 h-12 -top-2 -left-2 cursor-pointer"
                            value={field.value || "#000000"}
                            onChange={field.onChange}
                          />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            className="font-mono text-[10px] h-8 px-2"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div
              className="mt-4 p-4 rounded-lg border shadow-lg"
              style={{
                backgroundColor: form.watch(
                  "profile_data.custom_theme_colors.background"
                ),
                color: form.watch("profile_data.custom_theme_colors.foreground"),
                borderColor: form.watch(
                  "profile_data.custom_theme_colors.secondary"
                ),
              }}
            >
              <h4 className="font-bold text-sm mb-2">Preview</h4>
              <p className="mb-3 text-xs opacity-80">
                This is how your custom theme looks.
              </p>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: form.watch(
                    "profile_data.custom_theme_colors.primary"
                  ),
                  color: form.watch(
                    "profile_data.custom_theme_colors.background"
                  ),
                }}
              >
                Primary Button
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
