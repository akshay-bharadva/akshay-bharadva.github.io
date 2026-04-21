import { ComponentType } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface AdminPageConfig {
  title: string;
}

/**
 * Higher-order component that wraps an admin page with:
 * - Auth guard (redirects unauthenticated users)
 * - Loading spinner while auth is resolving
 * - AdminLayout with the configured title
 */
export function withAdminPage<P extends object>(
  ContentComponent: ComponentType<P>,
  config: AdminPageConfig,
) {
  function AdminPage(props: P) {
    const { isLoading } = useAuthGuard();

    if (isLoading) {
      return (
        <AdminLayout>
          <LoadingSpinner />
        </AdminLayout>
      );
    }

    return (
      <AdminLayout title={config.title}>
        <ContentComponent {...props} />
      </AdminLayout>
    );
  }

  AdminPage.displayName = `withAdminPage(${ContentComponent.displayName || ContentComponent.name || "Component"})`;

  return AdminPage;
}
