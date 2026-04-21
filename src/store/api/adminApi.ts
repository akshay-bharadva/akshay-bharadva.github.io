import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/supabase/client";
import type { Factor } from "@supabase/supabase-js";
import type {
  Event,
  BlogPost,
  Note,
  LifeUpdate,
  Task,
  SubTask,
  Transaction,
  RecurringTransaction,
  FinancialGoal,
  LearningSubject,
  LearningTopic,
  LearningSession,
  PortfolioSection,
  PortfolioItem,
  SiteContent,
  AnalyticsData,
  Habit,
  InventoryItem,
  NavLink,
  StorageAsset,
  CalendarItem,
} from "@/types";
import { format, subDays, addDays } from "date-fns";
import { publicApi } from "./publicApi";
import { BUCKET_NAME, HABIT_LOGS_LOOKBACK_DAYS } from "@/lib/constants";
import { MOCK_SITE_IDENTITY } from "@/lib/fallback-data";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "Notes",
    "Tasks",
    "Transactions",
    "Recurring",
    "Goals",
    "Learning",
    "PortfolioContent",
    "Assets",
    "Navigation",
    "SiteSettings",
    "AdminPosts",
    "Calendar",
    "Analytics",
    "Dashboard",
    "MFA",
    "SiteContent",
    "Habits",
    "Inventory",
    "LifeUpdates",
    "System"
  ],
  endpoints: (builder) => ({
    checkAdminExists: builder.query<boolean, void>({
      queryFn: async () => {
        if (!supabase) return { data: true };
        const { data, error } = await supabase.rpc("check_admin_exists");
        if (error) {
          console.error("RPC Error:", error);
          return { data: true };
        }
        return { data };
      },
      providesTags: ["System"], // <--- Tag this query
      keepUnusedDataFor: 300,
    }),
    getMfaFactors: builder.query<Factor[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) return { error };
        return { data: data?.totp || [] };
      },
      providesTags: ["MFA"],
    }),
    unenrollMfaFactor: builder.mutation<null, string>({
      queryFn: async (factorId) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["MFA"],
    }),
    updateUserPassword: builder.mutation<null, string>({
      queryFn: async (newPassword) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) return { error };
        return { data: null };
      },
    }),
    signOut: builder.mutation<null, void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.auth.signOut();
        if (error) return { error };
        return { data: null };
      },
    }),

    // --- DASHBOARD DATA ---
    getDashboardData: builder.query<any, void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };

        const now = new Date();
        const todayISO = format(now, "yyyy-MM-dd");
        const firstDayOfMonth = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
        const sevenDaysAgoISO = format(subDays(now, 7), "yyyy-MM-dd");
        const sevenDaysFromNowISO = format(addDays(now, 7), "yyyy-MM-dd");

        const promises = [
          supabase.rpc("get_total_blog_views"),
          supabase
            .from("tasks")
            .select("id, title, due_date")
            .lt("due_date", todayISO)
            .neq("status", "done"),
          supabase
            .from("tasks")
            .select("id, title")
            .eq("due_date", todayISO)
            .neq("status", "done"),
          supabase
            .from("tasks")
            .select("id, title, due_date")
            .gte("due_date", todayISO)
            .lte("due_date", sevenDaysFromNowISO)
            .neq("status", "done")
            .order("due_date"),
          supabase
            .from("notes")
            .select("id, title, content")
            .eq("is_pinned", true)
            .limit(5),
          supabase
            .from("blog_posts")
            .select("id, title, updated_at, slug, published")
            .order("updated_at", { ascending: false })
            .limit(3),
          supabase
            .from("transactions")
            .select("type, amount")
            .gte("date", firstDayOfMonth),
          supabase
            .from("transactions")
            .select("date, amount")
            .eq("type", "expense")
            .gte("date", sevenDaysAgoISO),
          supabase
            .from("transactions")
            .select("date, amount")
            .eq("type", "earning")
            .gte("date", sevenDaysAgoISO),
          supabase
            .from("recurring_transactions")
            .select("*")
            .order("start_date"),
          supabase
            .from("financial_goals")
            .select("*")
            .order("target_date")
            .limit(1),
        ];

        const results = await Promise.all(promises);
        const errors = results.map((r) => r.error).filter(Boolean);
        if (errors.length > 0) return { error: errors[0] };

        const [
          { data: totalViewsRes },
          { data: overdueTasksData },
          { data: tasksDueTodayData },
          { data: tasksDueSoonData },
          { data: pinnedNotesData },
          { data: recentPostsData },
          { data: monthlyTransactionsData },
          { data: dailyExpensesDataRaw },
          { data: dailyEarningsDataRaw },
          { data: recurringData },
          { data: primaryGoalData },
        ] = results as { data: unknown; error?: unknown }[];

        let monthlyEarnings = 0,
          monthlyExpenses = 0;
        (monthlyTransactionsData as { type: string; amount: number }[] | undefined)?.forEach((t) => {
          if (t.type === "earning") monthlyEarnings += t.amount;
          else if (t.type === "expense") monthlyExpenses += t.amount;
        });

        const createDailySummary = (rawData: { date: string; amount: number }[]) => {
          return (rawData || []).reduce((acc: Record<string, { day: string; total: number }>, t) => {
            const day = t.date.split("T")[0];
            if (!acc[day]) acc[day] = { day, total: 0 };
            acc[day].total += t.amount;
            return acc;
          }, {});
        };

        type DailyRecord = { date: string; amount: number };
        const dailyExpenses = Object.values(
          createDailySummary((dailyExpensesDataRaw || []) as DailyRecord[]),
        );
        const dailyEarnings = Object.values(
          createDailySummary((dailyEarningsDataRaw || []) as DailyRecord[]),
        );

        const data = {
          stats: {
            monthlyNet: monthlyEarnings - monthlyExpenses,
            totalBlogViews: totalViewsRes || 0,
          },
          recentPosts: recentPostsData || [],
          pinnedNotes: pinnedNotesData || [],
          overdueTasks: overdueTasksData || [],
          tasksDueToday: tasksDueTodayData || [],
          tasksDueSoon: tasksDueSoonData || [],
          dailyExpenses,
          dailyEarnings,
          recurring: recurringData || [],
          primaryGoal: (primaryGoalData as unknown[] | undefined)?.[0] || null,
        };

        return { data };
      },
      providesTags: [
        "Dashboard",
        "AdminPosts",
        "Notes",
        "Tasks",
        "Transactions",
        "Learning",
        "PortfolioContent",
        "Goals",
      ],
    }),

    getAnalyticsData: builder.query<AnalyticsData, void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase.rpc("get_analytics_overview");
        if (error) return { error };
        return { data };
      },
      providesTags: ["Analytics"],
    }),
    getCalendarData: builder.query<
      { baseEvents: CalendarItem[]; recurring: RecurringTransaction[] },
      { start: string; end: string }
    >({
      queryFn: async ({ start, end }) => {
        if (!supabase) return { error: { message: "No DB" } };
        const [calendarDataRes, recurringRes] = await Promise.all([
          supabase.rpc("get_calendar_data", {
            start_date_param: start,
            end_date_param: end,
          }),
          supabase.from("recurring_transactions").select("*"),
        ]);

        if (calendarDataRes.error || recurringRes.error) {
          return { error: calendarDataRes.error || recurringRes.error };
        }

        return {
          data: {
            baseEvents: calendarDataRes.data,
            recurring: recurringRes.data,
          },
        };
      },
      providesTags: ["Calendar", "Tasks", "Transactions", "Recurring"],
    }),
    addEvent: builder.mutation<Event, Partial<Event>>({
      queryFn: async (event) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("events")
          .insert(event)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Calendar"],
    }),
    updateEvent: builder.mutation<Event, Partial<Event>>({
      queryFn: async (event) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = event;
        const { data, error } = await supabase
          .from("events")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Calendar"],
    }),
    deleteEvent: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Calendar"],
    }),
    getAdminBlogPosts: builder.query<BlogPost[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "AdminPosts" as const, id })),
            { type: "AdminPosts", id: "LIST" },
          ]
          : [{ type: "AdminPosts", id: "LIST" }],
    }),
    addBlogPost: builder.mutation<BlogPost, Partial<BlogPost>>({
      queryFn: async (post) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(post)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: [{ type: "AdminPosts", id: "LIST" }],
    }),
    updateBlogPost: builder.mutation<BlogPost, Partial<BlogPost>>({
      queryFn: async (post) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = post;
        const { data, error } = await supabase
          .from("blog_posts")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "AdminPosts", id: arg.id },
      ],
    }),
    deleteBlogPost: builder.mutation<{ post: BlogPost }, BlogPost>({
      queryFn: async (post) => {
        if (!supabase) return { error: { message: "No DB" } };
        if (
          post.cover_image_url &&
          post.cover_image_url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)
        ) {
          const pathSegments = post.cover_image_url.split("/");
          const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
          if (bucketIndex !== -1) {
            const imagePath = pathSegments.slice(bucketIndex + 1).join("/");
            if (imagePath && imagePath.startsWith("blog_images/")) {
              await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
            }
          }
        }
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", post.id);
        if (error) return { error };
        return { data: { post } };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "AdminPosts", id: "LIST" },
        { type: "AdminPosts", id: arg.id },
      ],
    }),
    getNotes: builder.query<Note[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("updated_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Notes"],
    }),
    updateNote: builder.mutation<Note, Partial<Note>>({
      queryFn: async (note) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = note;
        const { data, error } = await supabase
          .from("notes")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Notes"],
    }),
    addNote: builder.mutation<Note, Partial<Note>>({
      queryFn: async (note) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("notes")
          .insert(note)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Notes"],
    }),
    deleteNote: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Notes"],
    }),
    getTasks: builder.query<Task[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("tasks")
          .select("*, sub_tasks(*)")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Tasks"],
    }),
    addTask: builder.mutation<Task, Partial<Task>>({
      queryFn: async (task) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("tasks")
          .insert(task)
          .select("*, sub_tasks(*)")
          .single();
        if (error) return { error };
        return { data };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: newTask } = await queryFulfilled;
          dispatch(
            adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
              draft.unshift(newTask);
            }),
          );
        } catch {
          // Task creation failed, no cache update needed
        }
      },
      invalidatesTags: ["Calendar"],
    }),
    updateTask: builder.mutation<Task, Partial<Task>>({
      queryFn: async (task) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = task;
        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", id!)
          .select("*, sub_tasks(*)")
          .single();
        if (error) return { error };
        return { data };
      },
      async onQueryStarted(task, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const existingTask = draft.find((t) => t.id === task.id);
            if (existingTask) {
              Object.assign(existingTask, task);
            }
          }),
        );
        try {
          const { data: updatedTask } = await queryFulfilled;
          dispatch(
            adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
              const index = draft.findIndex((t) => t.id === updatedTask.id);
              if (index !== -1) {
                draft[index] = updatedTask;
              }
            }),
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Calendar"],
    }),
    deleteTask: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Calendar"],
    }),
    addSubTask: builder.mutation<SubTask, Partial<SubTask>>({
      queryFn: async (subTask) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("sub_tasks")
          .insert(subTask)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      async onQueryStarted(subTask, { dispatch, queryFulfilled }) {
        try {
          const { data: newSubTask } = await queryFulfilled;
          dispatch(
            adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
              const task = draft.find((t) => t.id === subTask.task_id);
              if (task) {
                if (!task.sub_tasks) task.sub_tasks = [];
                task.sub_tasks.push(newSubTask);
              }
            }),
          );
        } catch {
          // Subtask creation failed
        }
      },
    }),
    updateSubTask: builder.mutation<SubTask, Partial<SubTask>>({
      queryFn: async (subTask) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = subTask;
        const { data, error } = await supabase
          .from("sub_tasks")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      async onQueryStarted(subTask, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
            for (const task of draft) {
              const st = task.sub_tasks?.find((s) => s.id === subTask.id);
              if (st) {
                Object.assign(st, subTask);
                break;
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteSubTask: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("sub_tasks")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getTasks", undefined, (draft) => {
            for (const task of draft) {
              if (task.sub_tasks) {
                const index = task.sub_tasks.findIndex((s) => s.id === id);
                if (index !== -1) {
                  task.sub_tasks.splice(index, 1);
                  break;
                }
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getFinancialData: builder.query<
      {
        transactions: Transaction[];
        goals: FinancialGoal[];
        recurring: RecurringTransaction[];
      },
      void
    >({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const [tranRes, goalRes, recurRes] = await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false }),
          supabase.from("financial_goals").select("*").order("target_date"),
          supabase
            .from("recurring_transactions")
            .select("*")
            .order("start_date"),
        ]);
        if (tranRes.error || goalRes.error || recurRes.error) {
          return { error: tranRes.error || goalRes.error || recurRes.error };
        }
        return {
          data: {
            transactions: tranRes.data,
            goals: goalRes.data,
            recurring: recurRes.data,
          },
        };
      },
      providesTags: ["Transactions", "Goals", "Recurring"],
    }),
    saveTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      queryFn: async (transaction) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = transaction;
        const promise = id
          ? supabase.from("transactions").update(updateData).eq("id", id)
          : supabase.from("transactions").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Transactions", "Calendar"],
    }),
    deleteTransaction: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Transactions", "Calendar"],
    }),
    saveRecurring: builder.mutation<
      RecurringTransaction,
      Partial<RecurringTransaction>
    >({
      queryFn: async (rec) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = rec;
        const promise = id
          ? supabase
            .from("recurring_transactions")
            .update(updateData)
            .eq("id", id)
          : supabase.from("recurring_transactions").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Recurring", "Calendar"],
    }),
    deleteRecurring: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("recurring_transactions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Recurring", "Calendar"],
    }),
    saveGoal: builder.mutation<FinancialGoal, Partial<FinancialGoal>>({
      queryFn: async (goal) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = goal;
        const promise = id
          ? supabase.from("financial_goals").update(updateData).eq("id", id)
          : supabase.from("financial_goals").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Goals"],
    }),
    addFundsToGoal: builder.mutation<
      FinancialGoal,
      { goal: FinancialGoal; amount: number }
    >({
      queryFn: async ({ goal, amount }) => {
        if (!supabase) return { error: { message: "No DB" } };
        const newCurrentAmount = goal.current_amount + amount;
        const { data, error } = await supabase
          .from("financial_goals")
          .update({ current_amount: newCurrentAmount })
          .eq("id", goal.id)
          .select()
          .single();
        if (error) return { error };

        const { error: transError } = await supabase
          .from("transactions")
          .insert({
            date: new Date().toISOString().split("T")[0],
            description: `Contribution to goal: ${goal.name}`,
            amount: amount,
            type: "expense",
            category: "Savings & Goals",
          });
        if (transError)
          console.warn(
            "Goal updated, but failed to create a matching transaction.",
            transError,
          );

        return { data };
      },
      invalidatesTags: ["Goals", "Transactions"],
    }),
    deleteGoal: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("financial_goals")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Goals"],
    }),
    manageCategory: builder.mutation<
      null,
      { type: "edit" | "merge" | "delete"; oldName: string; newName?: string }
    >({
      queryFn: async ({ type, oldName, newName }) => {
        if (!supabase) return { error: { message: "No DB" } };
        let rpcName:
          | "rename_transaction_category"
          | "merge_transaction_categories"
          | "delete_transaction_category"
          | null = null;
        let params: Record<string, string> = {};

        if (type === "edit" && newName) {
          rpcName = "rename_transaction_category";
          params = { old_name: oldName, new_name: newName };
        } else if (type === "merge" && newName) {
          rpcName = "merge_transaction_categories";
          params = { source_name: oldName, target_name: newName };
        } else if (type === "delete") {
          rpcName = "delete_transaction_category";
          params = { category_name: oldName };
        }

        if (!rpcName)
          return {
            error: {
              message: "Invalid action",
              details: "",
              hint: "",
              code: "400",
            },
          };

        const { error } = await supabase.rpc(rpcName, params);
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["Transactions"],
    }),
    getLearningData: builder.query<
      {
        subjects: LearningSubject[];
        topics: LearningTopic[];
        sessions: LearningSession[];
      },
      void
    >({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const [subjectsRes, topicsRes, sessionsRes] = await Promise.all([
          supabase.from("learning_subjects").select("*").order("name"),
          supabase.from("learning_topics").select("*").order("title"),
          supabase
            .from("learning_sessions")
            .select("*")
            .order("start_time", { ascending: false })
            .limit(100),
        ]);
        if (subjectsRes.error || topicsRes.error || sessionsRes.error) {
          return {
            error: subjectsRes.error || topicsRes.error || sessionsRes.error,
          };
        }
        return {
          data: {
            subjects: subjectsRes.data,
            topics: topicsRes.data,
            sessions: sessionsRes.data,
          },
        };
      },
      providesTags: ["Learning"],
    }),
    addLearningSession: builder.mutation<
      LearningSession,
      Partial<LearningSession>
    >({
      queryFn: async (session) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("learning_sessions")
          .insert(session)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    updateLearningSession: builder.mutation<
      LearningSession,
      Partial<LearningSession>
    >({
      queryFn: async (session) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = session;
        const { data, error } = await supabase
          .from("learning_sessions")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteLearningSession: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("learning_sessions")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),
    saveSubject: builder.mutation<LearningSubject, Partial<LearningSubject>>({
      queryFn: async (subject) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = subject;
        const promise = id
          ? supabase.from("learning_subjects").update(updateData).eq("id", id)
          : supabase.from("learning_subjects").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteSubject: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("learning_subjects")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),
    saveTopic: builder.mutation<LearningTopic, Partial<LearningTopic>>({
      queryFn: async (topic) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = topic;
        const promise = id
          ? supabase.from("learning_topics").update(updateData).eq("id", id)
          : supabase.from("learning_topics").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Learning"],
    }),
    deleteTopic: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("learning_topics")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Learning"],
    }),
    getSiteSettings: builder.query<SiteContent, void>({
      queryFn: async () => {
        if (!supabase) return { data: MOCK_SITE_IDENTITY };
        const { data, error } = await supabase
          .from("site_identity")
          .select("*")
          .single();
        if (error) return { error };
        return { data: data as SiteContent };
      },
      providesTags: ["SiteContent"],
    }),
    updateSiteSettings: builder.mutation<null, Partial<SiteContent>>({
      queryFn: async (updates) => {
        if (!supabase)
          return {
            error: {
              message:
                "Static mode: Supabase is not configured. Settings changes are preview-only and won't persist.",
            },
          };
        const { data, error } = await supabase
          .from("site_identity")
          .update(updates)
          .eq("id", 1)
          .select()
          .single();
        if (error) return { error };
        if (!data)
          return {
            error: {
              message:
                "No rows were updated. Check that the site_identity row exists and RLS policies allow writes.",
            },
          };
        return { data: null };
      },
      async onQueryStarted(updates, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData(
            "getSiteSettings",
            undefined,
            (draft) => {
              Object.assign(draft, updates);
            },
          ),
        );
        dispatch(
          publicApi.util.updateQueryData(
            "getSiteIdentity",
            undefined,
            (draft) => {
              Object.assign(draft, updates);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["SiteContent", "Navigation"],
    }),
    getNavLinksAdmin: builder.query<NavLink[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("navigation_links")
          .select("*")
          .order("display_order");
        if (error) return { error };
        return { data };
      },
      providesTags: ["Navigation"],
    }),
    saveNavLink: builder.mutation<NavLink, Partial<NavLink>>({
      queryFn: async (link) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = link;
        const promise = id
          ? supabase.from("navigation_links").update(updateData).eq("id", id)
          : supabase.from("navigation_links").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Navigation"],
    }),
    deleteNavLink: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("navigation_links")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["Navigation"],
    }),
    getPortfolioContent: builder.query<PortfolioSection[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("portfolio_sections")
          .select(`*, portfolio_items (*)`)
          .order("page_path")
          .order("display_order", { ascending: true })
          .order("display_order", {
            foreignTable: "portfolio_items",
            ascending: true,
          });
        if (error) return { error };
        return { data };
      },
      providesTags: ["PortfolioContent"],
    }),
    saveSection: builder.mutation<PortfolioSection, Partial<PortfolioSection>>({
      queryFn: async (section) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = section;
        const promise = id
          ? supabase.from("portfolio_sections").update(updateData).eq("id", id)
          : supabase.from("portfolio_sections").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["PortfolioContent"],
    }),
    deleteSection: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("portfolio_sections")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["PortfolioContent"],
    }),
    savePortfolioItem: builder.mutation<PortfolioItem, Partial<PortfolioItem>>({
      queryFn: async (item) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = item;
        const promise = id
          ? supabase.from("portfolio_items").update(updateData).eq("id", id)
          : supabase.from("portfolio_items").insert(updateData);
        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["PortfolioContent", "Assets"],
    }),
    deletePortfolioItem: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("portfolio_items")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["PortfolioContent", "Assets"],
    }),
    updateSectionOrder: builder.mutation<null, string[]>({
      queryFn: async (sectionIds) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.rpc("update_section_order", {
          section_ids: sectionIds,
        });
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["PortfolioContent"],
    }),
    getAssets: builder.query<StorageAsset[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("storage_assets")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Assets"],
    }),
    addAsset: builder.mutation<StorageAsset, Partial<StorageAsset>>({
      queryFn: async (asset) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("storage_assets")
          .insert(asset)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Assets"],
    }),
    updateAsset: builder.mutation<StorageAsset, Partial<StorageAsset>>({
      queryFn: async (asset) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = asset;
        const { data, error } = await supabase
          .from("storage_assets")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Assets"],
    }),
    deleteAsset: builder.mutation<{ id: string }, StorageAsset>({
      queryFn: async (asset) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([asset.file_path]);
        if (storageError) {
          return {
            error: {
              message: `Storage deletion failed: ${storageError.message}`,
            },
          };
        }

        const { error: dbError } = await supabase
          .from("storage_assets")
          .delete()
          .eq("id", asset.id);
        if (dbError) return { error: dbError };
        return { data: { id: asset.id } };
      },
      invalidatesTags: ["Assets"],
    }),
    moveAsset: builder.mutation<
      null,
      { assetId: string; oldPath: string; newPath: string }
    >({
      queryFn: async ({ assetId, oldPath, newPath }) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .move(oldPath, newPath);

        if (storageError) return { error: storageError };

        const { error: dbError } = await supabase
          .from("storage_assets")
          .update({ file_path: newPath })
          .eq("id", assetId);

        if (dbError) return { error: dbError };

        return { data: null };
      },
      invalidatesTags: ["Assets"],
    }),
    rescanAssetUsage: builder.mutation<null, void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.rpc("update_asset_usage");
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["Assets"],
    }),
    getHabits: builder.query<Habit[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const today = new Date();
        const lookbackDate = new Date();
        lookbackDate.setDate(today.getDate() - HABIT_LOGS_LOOKBACK_DAYS);

        const { data, error } = await supabase
          .from("habits")
          .select(`*, habit_logs(id, completed_date)`)
          .eq("is_active", true)
          .gte("habit_logs.completed_date", lookbackDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) return { error };
        return { data };
      },
      providesTags: ["Habits"],
    }),
    saveHabit: builder.mutation<Habit, Partial<Habit>>({
      queryFn: async (habit) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = habit;
        const promise = id
          ? supabase.from("habits").update(updateData).eq("id", id)
          : supabase.from("habits").insert(updateData);

        const { data, error } = await promise.select().single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Habits"],
    }),
    deleteHabit: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.from("habits").delete().eq("id", id);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["Habits"],
    }),
    toggleHabitLog: builder.mutation<void, { habit_id: string; date: string }>({
      queryFn: async ({ habit_id, date }) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data: existing, error: fetchError } = await supabase
          .from("habit_logs")
          .select("id")
          .eq("habit_id", habit_id)
          .eq("completed_date", date)
          .maybeSingle();

        if (fetchError) return { error: fetchError };

        if (existing) {
          const { error } = await supabase
            .from("habit_logs")
            .delete()
            .eq("id", existing.id);
          if (error) return { error };
        } else {
          const { error } = await supabase
            .from("habit_logs")
            .insert({ habit_id, completed_date: date });
          if (error) return { error };
        }
        return { data: undefined };
      },
      async onQueryStarted({ habit_id, date }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getHabits", undefined, (draft) => {
            const habit = draft.find((h) => h.id === habit_id);
            if (habit) {
              if (!habit.habit_logs) habit.habit_logs = [];
              const existingIndex = habit.habit_logs.findIndex(
                (l) => l.completed_date === date,
              );
              if (existingIndex !== -1) {
                habit.habit_logs.splice(existingIndex, 1);
              } else {
                habit.habit_logs.push({
                  id: "temp-id-" + Date.now(),
                  habit_id,
                  completed_date: date,
                });
              }
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    logFocusSession: builder.mutation<
      null,
      { duration_minutes: number; task_id?: string | null; mode: string }
    >({
      queryFn: async (data) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase.from("focus_logs").insert({
          duration_minutes: data.duration_minutes,
          task_id: data.task_id,
          mode: data.mode,
          start_time: new Date().toISOString(),
          completed: true,
        });
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: ["Analytics"],
    }),
    getInventory: builder.query<InventoryItem[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("inventory_items")
          .select("*")
          .order("purchase_date", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Inventory"],
    }),
    addInventoryItem: builder.mutation<InventoryItem, Partial<InventoryItem>>({
      queryFn: async (item) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("inventory_items")
          .insert(item)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Inventory"],
    }),
    updateInventoryItem: builder.mutation<
      InventoryItem,
      Partial<InventoryItem>
    >({
      queryFn: async (item) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = item;
        const { data, error } = await supabase
          .from("inventory_items")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Inventory"],
    }),
    deleteInventoryItem: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("inventory_items")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["Inventory"],
    }),
    getLifeUpdates: builder.query<LifeUpdate[], void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("public_notes")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("updated_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["LifeUpdates"],
    }),
    addLifeUpdate: builder.mutation<LifeUpdate, Partial<LifeUpdate>>({
      queryFn: async (update) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("public_notes")
          .insert(update)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["LifeUpdates"],
    }),
    updateLifeUpdate: builder.mutation<LifeUpdate, Partial<LifeUpdate>>({
      queryFn: async (update) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { id, ...updateData } = update;
        const { data, error } = await supabase
          .from("public_notes")
          .update(updateData)
          .eq("id", id!)
          .select()
          .single();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["LifeUpdates"],
    }),
    deleteLifeUpdate: builder.mutation<{ id: string }, string>({
      queryFn: async (id) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("public_notes")
          .delete()
          .eq("id", id);
        if (error) return { error };
        return { data: { id } };
      },
      invalidatesTags: ["LifeUpdates"],
    }),
    getSecuritySettings: builder.query<{ lockdown_level: number }, void>({
      queryFn: async () => {
        if (!supabase) return { error: { message: "No DB" } };
        const { data, error } = await supabase
          .from("security_settings")
          .select("lockdown_level")
          .single();
        if (error) return { error };
        return { data };
      },
      providesTags: ["SiteSettings"],
    }),
    updateLockdownLevel: builder.mutation<void, number>({
      queryFn: async (level) => {
        if (!supabase) return { error: { message: "No DB" } };
        const { error } = await supabase
          .from("security_settings")
          .update({ lockdown_level: level })
          .eq("id", 1);
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ["SiteSettings"],
    }),
  }),
});

export const {
  useCheckAdminExistsQuery,
  useGetDashboardDataQuery,
  useGetAnalyticsDataQuery,
  useGetCalendarDataQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAdminBlogPostsQuery,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetNotesQuery,
  useUpdateNoteMutation,
  useAddNoteMutation,
  useDeleteNoteMutation,
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
  useDeleteSubTaskMutation,
  useGetFinancialDataQuery,
  useSaveTransactionMutation,
  useDeleteTransactionMutation,
  useSaveRecurringMutation,
  useDeleteRecurringMutation,
  useSaveGoalMutation,
  useAddFundsToGoalMutation,
  useDeleteGoalMutation,
  useManageCategoryMutation,
  useGetLearningDataQuery,
  useAddLearningSessionMutation,
  useUpdateLearningSessionMutation,
  useDeleteLearningSessionMutation,
  useSaveSubjectMutation,
  useDeleteSubjectMutation,
  useSaveTopicMutation,
  useDeleteTopicMutation,
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useGetNavLinksAdminQuery,
  useSaveNavLinkMutation,
  useDeleteNavLinkMutation,
  useGetPortfolioContentQuery,
  useSaveSectionMutation,
  useDeleteSectionMutation,
  useSavePortfolioItemMutation,
  useDeletePortfolioItemMutation,
  useUpdateSectionOrderMutation,
  useGetAssetsQuery,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useRescanAssetUsageMutation,
  useGetMfaFactorsQuery,
  useUnenrollMfaFactorMutation,
  useUpdateUserPasswordMutation,
  useSignOutMutation,
  useGetHabitsQuery,
  useSaveHabitMutation,
  useDeleteHabitMutation,
  useToggleHabitLogMutation,
  useLogFocusSessionMutation,
  useGetInventoryQuery,
  useAddInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useGetLifeUpdatesQuery,
  useAddLifeUpdateMutation,
  useUpdateLifeUpdateMutation,
  useDeleteLifeUpdateMutation,
  useGetSecuritySettingsQuery,
  useUpdateLockdownLevelMutation,
  useMoveAssetMutation,
} = adminApi;