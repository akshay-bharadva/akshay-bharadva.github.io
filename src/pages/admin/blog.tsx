import BlogManager from "@/components/admin/blog-manager";
import { withAdminPage } from "@/components/admin/withAdminPage";

export default withAdminPage(BlogManager, { title: "Blog Manager" });
