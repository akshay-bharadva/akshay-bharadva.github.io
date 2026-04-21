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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Github } from "lucide-react";
import type { SiteSettingsFormValues } from "@/lib/schemas";

export interface GitHubSectionProps {
  form: UseFormReturn<SiteSettingsFormValues>;
}

export default function GitHubSection({ form }: GitHubSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="size-5 text-primary" /> GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="profile_data.github_projects_config.show"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel>Show GitHub Section</FormLabel>
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
          name="profile_data.github_projects_config.username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Username</FormLabel>
              <FormControl>
                <Input {...field} placeholder="your-username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-2">
              Advanced Options
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4 px-1">
              <FormField
                control={form.control}
                name="profile_data.github_projects_config.sort_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Repos By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pushed">Last Pushed</SelectItem>
                        <SelectItem value="updated">Last Updated</SelectItem>
                        <SelectItem value="created">Created Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile_data.github_projects_config.min_stars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Stars</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile_data.github_projects_config.projects_per_page"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Page</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-3 pt-2">
                <FormField
                  control={form.control}
                  name="profile_data.github_projects_config.exclude_forks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border rounded-md p-2">
                      <FormLabel className="text-sm font-normal">
                        Exclude Forks
                      </FormLabel>
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
                  name="profile_data.github_projects_config.exclude_archived"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border rounded-md p-2">
                      <FormLabel className="text-sm font-normal">
                        Exclude Archived
                      </FormLabel>
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
                  name="profile_data.github_projects_config.exclude_profile_repo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border rounded-md p-2">
                      <FormLabel className="text-sm font-normal">
                        Exclude Profile Repo
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
