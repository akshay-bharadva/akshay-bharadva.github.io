import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-8 w-48 sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}
