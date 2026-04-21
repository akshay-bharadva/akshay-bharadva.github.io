import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardOverview from "@/components/admin/DashboardOverview";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useGetDashboardDataQuery } from "@/store/api/adminApi";
import type { DashboardData } from "@/types";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shared";

export default function AdminIndexPage() {
  const { isLoading, session } = useAuthGuard();
  const router = useRouter();

  const { data: dashboardData, isLoading: isDataLoading } =
    useGetDashboardDataQuery(undefined, {
      skip: !session,
    });

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's your portfolio's command center."
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 size-4" /> Quick Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/admin/blog")}>
                  New Blog Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/tasks")}>
                  New Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/notes")}>
                  New Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/finance")}>
                  New Transaction
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        {isDataLoading || !dashboardData ? (
          <LoadingSpinner />
        ) : (
          <DashboardOverview
            dashboardData={dashboardData}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </AdminLayout>
  );
}
