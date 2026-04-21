import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import { withAdminPage } from "@/components/admin/withAdminPage";

export default withAdminPage(SiteSettingsManager, { title: "Site Settings" });
