// Centralized Zod schemas for form validation

import { z } from "zod";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TRANSACTION_TYPE,
  FREQUENCY,
  LEARNING_STATUS,
} from "./constants";

// =============================================================================
// REUSABLE SCHEMA FRAGMENTS
// =============================================================================

/** Optional string that can be null */
export const optionalString = z.string().optional().nullable();

/** URL or empty string validation */
export const urlOrEmpty = z
  .string()
  .url("Must be a valid URL")
  .or(z.literal(""));

/** Date string in YYYY-MM-DD format */
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

/** Required date string */
export const requiredDateString = z.string().min(1, "Date is required");

// =============================================================================
// TASK SCHEMAS
// =============================================================================

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE]),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH]),
  due_date: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const subTaskSchema = z.object({
  task_id: z.string(),
  title: z.string().min(1, "Title is required"),
  is_completed: z.boolean().default(false),
});

export type SubTaskFormValues = z.infer<typeof subTaskSchema>;

// =============================================================================
// TRANSACTION SCHEMAS
// =============================================================================

export const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum([TRANSACTION_TYPE.EARNING, TRANSACTION_TYPE.EXPENSE]),
  category: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const recurringTransactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum([TRANSACTION_TYPE.EXPENSE, TRANSACTION_TYPE.EARNING]),
  category: z.string().optional(),
  frequency: z.enum([
    FREQUENCY.DAILY,
    FREQUENCY.WEEKLY,
    FREQUENCY.BI_WEEKLY,
    FREQUENCY.MONTHLY,
    FREQUENCY.YEARLY,
  ]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().nullable(),
  occurrence_day: z.coerce.number().optional().nullable(),
});

export type RecurringTransactionFormValues = z.infer<
  typeof recurringTransactionSchema
>;

export const financialGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  description: optionalString,
  target_amount: z.coerce.number().positive("Target amount must be positive"),
  current_amount: z.coerce.number().min(0).default(0),
  target_date: optionalString,
});

export type FinancialGoalFormValues = z.infer<typeof financialGoalSchema>;

// =============================================================================
// HABIT SCHEMAS
// =============================================================================

export const habitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  color: z.string().min(1, "Color is required"),
  target_per_week: z.coerce.number().min(1).max(7),
});

export type HabitFormValues = z.infer<typeof habitSchema>;

// =============================================================================
// LEARNING SCHEMAS
// =============================================================================

export const learningSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: optionalString,
});

export type LearningSubjectFormValues = z.infer<typeof learningSubjectSchema>;

export const learningTopicSchema = z.object({
  subject_id: z.string().min(1, "Subject is required"),
  title: z.string().min(1, "Title is required"),
  status: z.enum([
    LEARNING_STATUS.TO_LEARN,
    LEARNING_STATUS.LEARNING,
    LEARNING_STATUS.PRACTICING,
    LEARNING_STATUS.MASTERED,
  ]),
  core_notes: optionalString,
  confidence_score: z.coerce.number().min(0).max(100).optional().nullable(),
  resources: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .optional()
    .nullable(),
});

export type LearningTopicFormValues = z.infer<typeof learningTopicSchema>;

// =============================================================================
// NOTE SCHEMAS
// =============================================================================

export const noteSchema = z.object({
  title: optionalString,
  content: optionalString,
  tags: z.array(z.string()).optional().nullable(),
  color: optionalString,
  is_pinned: z.boolean().optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// =============================================================================
// LIFE UPDATE SCHEMAS
// =============================================================================

export const lifeUpdateSchema = z.object({
  title: optionalString,
  content: optionalString,
  category: z.enum(["watching", "activity", "photo", "thought", "milestone"]).default("thought"),
  image_url: optionalString,
  tags: z.array(z.string()).optional().nullable(),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().default(false),
});

export type LifeUpdateFormValues = z.infer<typeof lifeUpdateSchema>;

// =============================================================================
// EVENT SCHEMAS
// =============================================================================

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: optionalString,
  start_time: z.string().min(1, "Start time is required"),
  end_time: optionalString,
  is_all_day: z.boolean().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

// =============================================================================
// INVENTORY SCHEMAS
// =============================================================================

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serial_number: optionalString,
  purchase_date: optionalString,
  warranty_expiry: optionalString,
  purchase_price: z.coerce.number().min(0, "Price must be non-negative"),
  current_value: z.coerce.number().min(0).optional().nullable(),
  image_url: optionalString,
  notes: optionalString,
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

// =============================================================================
// PORTFOLIO & CONTENT SCHEMAS
// =============================================================================

export const portfolioSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["markdown", "list_items", "gallery"]),
  content: optionalString,
  page_path: z.string().min(1, "Page path is required"),
  layout_style: z.string().default("default"),
  is_visible: z.boolean().default(true),
});

export type PortfolioSectionFormValues = z.infer<typeof portfolioSectionSchema>;

export const portfolioItemSchema = z.object({
  section_id: z.string().min(1, "Section is required"),
  title: z.string().min(1, "Title is required"),
  subtitle: optionalString,
  date_from: optionalString,
  date_to: optionalString,
  description: optionalString,
  image_url: optionalString,
  link_url: optionalString,
  tags: z.array(z.string()).optional().nullable(),
  internal_notes: optionalString,
});

export type PortfolioItemFormValues = z.infer<typeof portfolioItemSchema>;

export const navLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  href: z.string().min(1, "URL is required"),
  display_order: z.coerce.number().default(0),
  is_visible: z.boolean().default(true),
});

export type NavLinkFormValues = z.infer<typeof navLinkSchema>;

// =============================================================================
// BLOG SCHEMAS
// =============================================================================

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: optionalString,
  content: optionalString,
  cover_image_url: optionalString,
  published: z.boolean().default(false),
  published_at: optionalString,
  show_toc: z.boolean().default(true),
  tags: z.array(z.string()).optional().nullable(),
  internal_notes: optionalString,
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// =============================================================================
// CONTACT FORM SCHEMA
// =============================================================================

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// =============================================================================
// SITE SETTINGS SCHEMAS
// =============================================================================

export const socialLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  is_visible: z.boolean(),
});

export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;

export const siteSettingsSchema = z.object({
  portfolio_mode: z.enum(["multi-page", "single-page"]),
  profile_data: z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
    default_theme: z.string(),
    custom_theme_colors: z
      .object({
        background: z.string().default("#0f172a"),
        foreground: z.string().default("#e2e8f0"),
        primary: z.string().default("#0ea5e9"),
        secondary: z.string().default("#1e293b"),
        accent: z.string().default("#38bdf8"),
        card: z.string().default("#1e293b"),
      })
      .optional(),
    description: z.string().min(1, "Hero description is required"),
    profile_picture_url: z
      .string()
      .url("Must be a valid URL")
      .or(z.literal("")),
    show_profile_picture: z.boolean(),
    logo: z.object({
      main: z.string().min(1, "Main logo text is required"),
      highlight: z.string().min(1, "Highlight logo text is required"),
    }),
    bio: z.array(z.string()).min(1, "At least one bio paragraph is required"),
    status_panel: z.object({
      show: z.boolean().default(true),
      design: z.enum(["minimal", "terminal", "bento"]).default("minimal"),
      title: z.string(),
      availability: z.string().min(1, "Availability text is required"),
      currently_exploring: z.object({
        title: z.string(),
        items: z
          .array(z.string())
          .transform((items) => items.filter((item) => item.trim() !== "")),
      }),
      latestProject: z.object({
        name: z.string().min(1, "Project name is required"),
        linkText: z.string().min(1, "Link text is required"),
        href: z.string().min(1, "Project URL path is required"),
      }),
    }),
    github_projects_config: z.object({
      username: z.string().min(1, "GitHub username is required."),
      show: z.boolean(),
      sort_by: z.enum(["pushed", "created", "updated"]),
      exclude_forks: z.boolean(),
      exclude_archived: z.boolean(),
      exclude_profile_repo: z.boolean(),
      min_stars: z.coerce.number().min(0, "Cannot be negative."),
      projects_per_page: z.coerce
        .number()
        .min(1, "Must be at least 1.")
        .max(100, "Max is 100."),
    }),
    contact_page: z.object({
      show_contact_form: z.boolean().default(true),
      show_availability_badge: z.boolean().default(true),
      show_services: z.boolean().default(true),
    }),
    updates_layout: z.enum(["timeline", "scrapbook"]).default("scrapbook"),
    typography_preset: z.string().default("typo-default"),
  }),
  social_links: z.array(socialLinkSchema),
  footer_data: z.object({
    copyright_text: z.string().min(1, "Copyright text is required"),
  }),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

/** Default values for site settings form */
export const siteSettingsDefaultValues: SiteSettingsFormValues = {
  portfolio_mode: "multi-page",
  profile_data: {
    name: "",
    title: "",
    description: "",
    profile_picture_url: "",
    default_theme: "theme-blueprint",
    custom_theme_colors: {
      background: "#0f172a",
      foreground: "#e2e8f0",
      primary: "#0ea5e9",
      secondary: "#1e293b",
      accent: "#38bdf8",
      card: "#1e293b",
    },
    show_profile_picture: true,
    logo: { main: "", highlight: "" },
    bio: [""],
    status_panel: {
      show: true,
      design: "minimal",
      title: "Status Panel",
      availability: "",
      currently_exploring: { title: "Exploring", items: [""] },
      latestProject: { name: "", linkText: "", href: "" },
    },
    github_projects_config: {
      username: "",
      show: true,
      sort_by: "pushed",
      exclude_forks: true,
      exclude_archived: true,
      exclude_profile_repo: true,
      min_stars: 1,
      projects_per_page: 9,
    },
    contact_page: {
      show_contact_form: true,
      show_availability_badge: true,
      show_services: true,
    },
    updates_layout: "scrapbook",
    typography_preset: "typo-default",
  },
  social_links: [
    { id: "github", label: "GitHub", url: "", is_visible: true },
    { id: "linkedin", label: "LinkedIn", url: "", is_visible: true },
    { id: "email", label: "Email", url: "", is_visible: true },
  ],
  footer_data: { copyright_text: "" },
};
