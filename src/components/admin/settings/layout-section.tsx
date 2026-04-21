import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { LayoutDashboard, Clock, BookImage } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface LayoutSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function LayoutSection({ form }: LayoutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="size-5 text-primary" /> Global Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Mode */}
        <div>
          <h4 className="text-sm font-medium mb-2">Portfolio Mode</h4>
          <FormField
            control={form.control}
            name="portfolio_mode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col gap-2"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-2 hover:bg-secondary/10 cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="multi-page" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">
                        Multi-Page
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-2 hover:bg-secondary/10 cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="single-page" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">
                        Single-Page
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Updates Layout */}
        <div>
          <h4 className="text-sm font-medium mb-1">Updates Page Layout</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Choose how life updates are displayed on the public page.
          </p>
          <FormField
            control={form.control}
            name="profile_data.updates_layout"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || "scrapbook"}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <FormItem className="space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="scrapbook"
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center gap-2 border-2 rounded-lg p-4 cursor-pointer hover:bg-secondary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                        <BookImage className="size-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                        <div className="text-center">
                          <p className="font-medium text-sm">Scrapbook</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Polaroid cards with washi tape and random rotations
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>

                    <FormItem className="space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="timeline"
                          className="peer sr-only"
                        />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center gap-2 border-2 rounded-lg p-4 cursor-pointer hover:bg-secondary/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                        <Clock className="size-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                        <div className="text-center">
                          <p className="font-medium text-sm">Timeline</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Chronological feed with month grouping and colored dots
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
