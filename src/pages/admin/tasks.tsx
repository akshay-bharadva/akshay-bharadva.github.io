import TaskManager from "@/components/admin/tasks-manager";
import { withAdminPage } from "@/components/admin/withAdminPage";

export default withAdminPage(TaskManager, { title: "Task Board" });
