import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Type, Check } from "lucide-react";
import { TYPOGRAPHY_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface TypographySectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function TypographySection({ form }: TypographySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="size-5 text-primary" /> Typography
        </CardTitle>
        <CardDescription>
          Choose a font combination that defines your portfolio&apos;s personality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="profile_data.typography_preset"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TYPOGRAPHY_PRESETS.map((preset) => {
                    const isActive = field.value === preset.value;
                    const isSerif = ["Playfair Display", "Instrument Serif", "Libre Baskerville"].includes(preset.heading);
                    return (
                      <button
                        type="button"
                        key={preset.value}
                        onClick={() => field.onChange(preset.value)}
                        className={cn(
                          "relative text-left rounded-lg border-2 p-3.5 transition-all group",
                          isActive
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-muted-foreground/30 hover:bg-accent/20"
                        )}
                      >
                        {isActive && (
                          <div className="absolute top-2.5 right-2.5 size-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="size-3 text-primary-foreground" />
                          </div>
                        )}

                        {/* Large display preview */}
                        <div className="mb-3 pr-6">
                          <p
                            className="text-2xl text-foreground leading-tight"
                            style={{
                              fontFamily: `"${preset.heading}", ${isSerif ? "serif" : "sans-serif"}`,
                              letterSpacing: "-0.02em",
                              fontWeight: preset.heading === "Instrument Serif" ? 400 : 700,
                            }}
                          >
                            Aa
                          </p>
                        </div>

                        {/* Mini site mockup */}
                        <div
                          className="rounded border border-border/40 bg-background/60 p-2.5 space-y-1.5 mb-2.5"
                          style={{ fontFamily: `"${preset.body}", sans-serif` }}
                        >
                          <p
                            className="text-sm text-foreground leading-snug"
                            style={{
                              fontFamily: `"${preset.heading}", ${isSerif ? "serif" : "sans-serif"}`,
                              fontWeight: preset.heading === "Instrument Serif" ? 400 : 700,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            Hello, I&apos;m Derek
                          </p>
                          <p
                            className="text-[11px] text-muted-foreground leading-relaxed"
                            style={{ fontFamily: `"${preset.body}", sans-serif` }}
                          >
                            Building beautiful things for the web.
                          </p>
                          <div className="flex gap-2 items-center">
                            <span
                              className="text-[9px] px-1.5 py-0.5 bg-muted/60 rounded text-muted-foreground/80"
                              style={{ fontFamily: `"${preset.code}", monospace` }}
                            >
                              npm run dev
                            </span>
                            <span
                              className="text-[9px] text-primary"
                              style={{ fontFamily: `"${preset.body}", sans-serif` }}
                            >
                              View Projects →
                            </span>
                          </div>
                        </div>

                        {/* Label + font names */}
                        <p className="text-xs font-semibold text-foreground">
                          {preset.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          {preset.description}
                        </p>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5 text-[9px] text-muted-foreground/70">
                          <span>
                            Display{" "}
                            <span className="font-medium text-muted-foreground">
                              {preset.heading}
                            </span>
                          </span>
                          <span>
                            Body{" "}
                            <span className="font-medium text-muted-foreground">
                              {preset.body}
                            </span>
                          </span>
                          <span>
                            Code{" "}
                            <span className="font-medium text-muted-foreground">
                              {preset.code}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
