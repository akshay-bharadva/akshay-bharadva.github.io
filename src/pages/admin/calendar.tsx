import AdminLayout from "@/components/admin/AdminLayout";
import CommandCalendar from "@/components/admin/CommandCalendar";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/router";

export default function AdminCalendarPage() {
  const { isLoading } = useAuthGuard();
  const router = useRouter();

  const handleNavigate = (tab: string) => {
    router.push(`/admin/${tab}`);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Calendar">
      <CommandCalendar onNavigate={handleNavigate} />
    </AdminLayout>
  );
}
