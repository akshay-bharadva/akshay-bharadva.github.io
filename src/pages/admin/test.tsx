import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Loader2,
  FlaskConical,
  AlertTriangle,
  Timer,
  FileClock,
} from "lucide-react";
import { cn, getErrorMessage } from "@/lib/utils";
import { store } from "@/store/store";
import {
  adminApi,
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
  useSaveTransactionMutation,
  useDeleteTransactionMutation,
  useSaveRecurringMutation,
  useDeleteRecurringMutation,
  useSaveGoalMutation,
  useDeleteGoalMutation,
  useSaveSubjectMutation,
  useDeleteSubjectMutation,
  useSaveTopicMutation,
  useDeleteTopicMutation,
  useSaveSectionMutation,
  useDeleteSectionMutation,
  useSavePortfolioItemMutation,
  useDeletePortfolioItemMutation,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from "@/store/api/adminApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

type TestStatus = "pending" | "running" | "success" | "fail";
interface TestLog {
  name: string;
  status: TestStatus;
  message?: string;
  duration?: number;
}

export default function AdminTestPage() {
  const { isLoading } = useAuthGuard();
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const stopTestingRef = useRef(false);

  // Mutation Hooks
  const [addBlogPost] = useAddBlogPostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();
  const [deleteBlogPost] = useDeleteBlogPostMutation();
  const [addNote] = useAddNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addSubTask] = useAddSubTaskMutation();
  const [updateSubTask] = useUpdateSubTaskMutation();
  const [deleteSubTask] = useDeleteSubTaskMutation();
  const [saveTransaction] = useSaveTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [saveRecurring] = useSaveRecurringMutation();
  const [deleteRecurring] = useDeleteRecurringMutation();
  const [saveGoal] = useSaveGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();
  const [saveSubject] = useSaveSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [saveTopic] = useSaveTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [saveSection] = useSaveSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [savePortfolioItem] = useSavePortfolioItemMutation();
  const [deletePortfolioItem] = useDeletePortfolioItemMutation();
  const [saveNavLink] = useSaveNavLinkMutation();
  const [deleteNavLink] = useDeleteNavLinkMutation();
  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [addAsset] = useAddAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const { data: siteSettingsData, isLoading: isLoadingSettings } =
    useGetSiteSettingsQuery();
  const [updateSiteSettings] = useUpdateSiteSettingsMutation();

  const addLog = (log: TestLog) =>
    setLogs((prev) => [...prev.filter((l) => l.name !== log.name), log]);

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    if (stopTestingRef.current) throw new Error("Test run cancelled by user.");
    addLog({ name, status: "running" });
    const startTime = Date.now();
    try {
      const result = await testFn();
      addLog({ name, status: "success", duration: Date.now() - startTime });
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      addLog({
        name,
        status: "fail",
        message,
        duration: Date.now() - startTime,
      });
      throw new Error(`Test failed: ${name}`);
    }
  };

  const handleRunAllTests = async () => {
    setIsTesting(true);
    stopTestingRef.current = false;
    setLogs([]);
    store.dispatch(adminApi.util.resetApiState());

    const testId = `test-${Date.now()}`;
    const startTime = Date.now();

    try {
      const postRes = await runTest("Blog: Create", () =>
        addBlogPost({
          title: `[TEST] ${testId}`,
          slug: testId,
          content: "c",
        }).unwrap(),
      );
      await runTest("Blog: Update", () =>
        updateBlogPost({
          id: postRes.id,
          title: `[TEST] ${testId} [U]`,
        }).unwrap(),
      );
      await runTest("Blog: Delete", () => deleteBlogPost(postRes).unwrap());

      const noteRes = await runTest("Notes: Create", () =>
        addNote({ title: `[TEST] ${testId}` }).unwrap(),
      );
      await runTest("Notes: Update", () =>
        updateNote({ id: noteRes.id, content: "[U]" }).unwrap(),
      );
      await runTest("Notes: Delete", () => deleteNote(noteRes.id).unwrap());

      const taskRes = await runTest("Tasks: Create", () =>
        addTask({ title: `[TEST] ${testId}` }).unwrap(),
      );
      await runTest("Tasks: Update", () =>
        updateTask({ id: taskRes.id, status: "inprogress" }).unwrap(),
      );
      const subTaskRes = await runTest("SubTasks: Create", () =>
        addSubTask({ task_id: taskRes.id, title: "[TEST] Subtask" }).unwrap(),
      );
      await runTest("SubTasks: Update", () =>
        updateSubTask({ id: subTaskRes.id, is_completed: true }).unwrap(),
      );
      await runTest("SubTasks: Delete", () =>
        deleteSubTask(subTaskRes.id).unwrap(),
      );
      await runTest("Tasks: Delete", () => deleteTask(taskRes.id).unwrap());

      // Test Transactions
      const transRes = await runTest("Transactions: Create", () =>
        saveTransaction({
          date: "2024-01-01",
          description: `[TEST] ${testId}`,
          amount: 1,
          type: "expense",
        }).unwrap(),
      );
      await runTest("Transactions: Delete", () =>
        deleteTransaction(transRes.id).unwrap(),
      );

      // Test Recurring
      const recurRes = await runTest("Recurring: Create", () =>
        saveRecurring({
          description: `[TEST] ${testId}`,
          amount: 1,
          type: "expense",
          frequency: "monthly",
          start_date: "2024-01-01",
        }).unwrap(),
      );
      await runTest("Recurring: Delete", () =>
        deleteRecurring(recurRes.id).unwrap(),
      );

      // Test Goals
      const goalRes = await runTest("Goals: Create", () =>
        saveGoal({ name: `[TEST] ${testId}`, target_amount: 100 }).unwrap(),
      );
      await runTest("Goals: Update", () =>
        saveGoal({ id: goalRes.id, current_amount: 50 }).unwrap(),
      );
      await runTest("Goals: Delete", () => deleteGoal(goalRes.id).unwrap());

      // Test Learning
      const subjectRes = await runTest("Subjects: Create", () =>
        saveSubject({ name: `[TEST] ${testId}` }).unwrap(),
      );
      const topicRes = await runTest("Topics: Create", () =>
        saveTopic({
          title: `[TEST] ${testId}`,
          subject_id: subjectRes.id,
        }).unwrap(),
      );
      await runTest("Topics: Update", () =>
        saveTopic({ id: topicRes.id, status: "Learning" }).unwrap(),
      );
      await runTest("Topics: Delete", () => deleteTopic(topicRes.id).unwrap());
      await runTest("Subjects: Delete", () =>
        deleteSubject(subjectRes.id).unwrap(),
      );

      // Test Portfolio
      const sectionRes = await runTest("Sections: Create", () =>
        saveSection({
          title: `[TEST] ${testId}`,
          type: "list_items",
          page_path: "/test",
        }).unwrap(),
      );
      const itemRes = await runTest("Items: Create", () =>
        savePortfolioItem({
          section_id: sectionRes.id,
          title: `[TEST] ${testId}`,
        }).unwrap(),
      );
      await runTest("Items: Update", () =>
        savePortfolioItem({ id: itemRes.id, subtitle: "[U]" }).unwrap(),
      );
      await runTest("Items: Delete", () =>
        deletePortfolioItem(itemRes.id).unwrap(),
      );
      await runTest("Sections: Delete", () =>
        deleteSection(sectionRes.id).unwrap(),
      );

      // Test Nav Links
      const navRes = await runTest("NavLinks: Create", () =>
        saveNavLink({ label: `[TEST] ${testId}`, href: `/${testId}` }).unwrap(),
      );
      await runTest("NavLinks: Update", () =>
        saveNavLink({ id: navRes.id, is_visible: false }).unwrap(),
      );
      await runTest("NavLinks: Delete", () =>
        deleteNavLink(navRes.id).unwrap(),
      );

      // Test Events
      const eventRes = await runTest("Events: Create", () =>
        addEvent({
          title: `[TEST] ${testId}`,
          start_time: new Date().toISOString(),
        }).unwrap(),
      );
      await runTest("Events: Update", () =>
        updateEvent({ id: eventRes.id, description: "[U]" }).unwrap(),
      );
      await runTest("Events: Delete", () => deleteEvent(eventRes.id).unwrap());

      // Test Assets
      const assetRes = await runTest("Assets: Create", () =>
        addAsset({
          file_name: `[TEST] ${testId}`,
          file_path: `test/${testId}`,
        }).unwrap(),
      );
      await runTest("Assets: Update", () =>
        updateAsset({ id: assetRes.id, alt_text: "[U]" }).unwrap(),
      );
      await runTest("Assets: Delete", () => deleteAsset(assetRes).unwrap());

      // Test Site Settings (Read -> Update -> Revert)
      if (siteSettingsData) {
        const originalMode = siteSettingsData.portfolio_mode;
        const newMode =
          originalMode === "multi-page" ? "single-page" : "multi-page";
        await runTest("SiteSettings: Update", () =>
          updateSiteSettings({ portfolio_mode: newMode }).unwrap(),
        );
        await runTest("SiteSettings: Revert", () =>
          updateSiteSettings({ portfolio_mode: originalMode }).unwrap(),
        );
      } else {
        addLog({
          name: "SiteSettings: Skipped",
          status: "fail",
          message: "Initial settings not loaded.",
        });
      }

      const successCount = logs.filter((l) => l.status === "success").length;
      toast.success(`All ${successCount} tests completed successfully!`);
    } catch (error: unknown) {
      toast.error("A test failed. Stopping execution.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsTesting(false);
      stopTestingRef.current = false;
      store.dispatch(
        adminApi.util.invalidateTags([
          "AdminPosts",
          "Notes",
          "Tasks",
          "Transactions",
          "Recurring",
          "Goals",
          "Learning",
          "PortfolioContent",
          "Assets",
          "Navigation",
          "SiteContent",
          "Calendar",
          "Dashboard",
        ]),
      );
    }
  };

  const summary = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const fail = logs.filter((l) => l.status === "fail").length;
    const duration = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
    return { total, success, fail, duration };
  }, [logs]);

  if (isLoading)
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );

  return (
    <AdminLayout title="System Tests">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">CRUD Integration Test</h2>
            <p className="text-muted-foreground">
              Run a full Create, Read, Update, Delete cycle on all database
              tables.
            </p>
          </div>
          <Button
            onClick={
              isTesting
                ? () => (stopTestingRef.current = true)
                : handleRunAllTests
            }
            disabled={isLoadingSettings}
            size="lg"
            variant={isTesting ? "destructive" : "default"}
          >
            {isTesting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 size-4" />
            )}
            {isTesting
              ? "Stop Tests"
              : isLoadingSettings
                ? "Loading..."
                : "Run All Tests"}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This performs live database operations. While it cleans up after
            itself, running this on a production database is not recommended.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tests Passed
              </CardTitle>
              <CheckCircle className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summary.success} / {summary.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tests Failed
              </CardTitle>
              <XCircle className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {summary.fail}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Duration
              </CardTitle>
              <Timer className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.duration}ms</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Test Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">Status</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow
                      key={index}
                      className={
                        log.status === "fail" ? "bg-destructive/10" : ""
                      }
                    >
                      <TableCell>
                        <div className="flex justify-center">
                          <FileClock />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.duration !== undefined
                          ? `${log.duration}ms`
                          : "..."}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span>{log.message || "—"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md">{log.message}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Click "Run All Tests" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
