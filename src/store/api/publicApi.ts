import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/supabase/client";
import {
  MOCK_SITE_IDENTITY,
  MOCK_BLOG_POSTS,
  MOCK_SECTIONS,
  MOCK_NAV_LINKS,
  MOCK_LIFE_UPDATES,
} from "@/lib/fallback-data";
import type {
  BlogPost,
  GitHubRepo,
  LifeUpdate,
  PortfolioSection,
  SiteContent,
} from "@/types";

type NavLink = { label: string; href: string };

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "SiteContent",
    "Posts",
    "Post",
    "Portfolio",
    "Navigation",
    "SiteSettings",
    "LifeUpdates",
  ],
  endpoints: (builder) => ({
    getSiteIdentity: builder.query<SiteContent, void>({
      queryFn: async () => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
          return { data: MOCK_SITE_IDENTITY };
        }
        // ---------------------

        const { data, error } = await supabase
          .from("site_identity")
          .select("*")
          .single();
        if (error) return { error };
        return { data: data as SiteContent };
      },
      providesTags: ["SiteContent"],
    }),

    getNavLinks: builder.query<NavLink[], void>({
      queryFn: async () => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
          return { data: MOCK_NAV_LINKS };
        }
        // ---------------------

        const [identityRes, linksRes] = await Promise.all([
          supabase.from("site_identity").select("portfolio_mode").single(),
          supabase
            .from("navigation_links")
            .select("label, href")
            .eq("is_visible", true)
            .order("display_order"),
        ]);

        if (linksRes.error) return { error: linksRes.error };

        const portfolioMode = identityRes.data?.portfolio_mode || "multi-page";
        let finalLinks = linksRes.data || [];

        if (portfolioMode === "single-page") {
          finalLinks = finalLinks.filter(
            (link) =>
              link.href === "/" ||
              link.href === "/contact" ||
              link.href === "/blog",
          );
        }
        return { data: finalLinks };
      },
      providesTags: ["Navigation", "SiteContent"],
    }),

    getPublishedBlogPosts: builder.query<BlogPost[], void>({
      queryFn: async () => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
          return { data: MOCK_BLOG_POSTS };
        }
        // ---------------------

        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Posts" as const, id })),
              { type: "Posts", id: "LIST" },
            ]
          : [{ type: "Posts", id: "LIST" }],
    }),

    getBlogPostBySlug: builder.query<BlogPost, string>({
      queryFn: async (slug) => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
          const post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);
          if (!post)
            return {
              error: {
                message: "Not Found",
                details: "Mock",
                hint: "",
                code: "404",
              },
            };
          return { data: post };
        }
        // ---------------------

        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();
        if (error && error.code !== "PGRST116") return { error };
        if (!data)
          return {
            error: { message: "Not Found", details: "", hint: "", code: "404" },
          };
        return { data };
      },
      providesTags: (result) =>
        result ? [{ type: "Post", id: result.id }] : [],
    }),

    incrementPostView: builder.mutation<void, string>({
      queryFn: async (postId) => {
        // --- MOCK FALLBACK ---
        if (!supabase) return { data: undefined };
        // ---------------------

        const { error } = await supabase.rpc("increment_blog_post_view", {
          post_id_to_increment: postId,
        });
        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "Posts", id: "LIST" },
      ],
    }),

    getPublishedLifeUpdates: builder.query<LifeUpdate[], void>({
      queryFn: async () => {
        if (!supabase) {
          return { data: MOCK_LIFE_UPDATES };
        }
        const { data, error } = await supabase
          .from("public_notes")
          .select("*")
          .eq("is_published", true)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["LifeUpdates"],
    }),

    getSectionsByPath: builder.query<PortfolioSection[], string>({
      queryFn: async (pagePath) => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
          return {
            data: MOCK_SECTIONS.filter((s) => s.page_path === pagePath),
          };
        }
        // ---------------------

        const { data, error } = await supabase
          .from("portfolio_sections")
          .select("*, portfolio_items(*)")
          .eq("page_path", pagePath)
          .eq("is_visible", true)
          .order("display_order")
          .order("display_order", { foreignTable: "portfolio_items" });
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, path) => [{ type: "Portfolio", id: path }],
    }),

    getGitHubRepos: builder.query<
      GitHubRepo[],
      {
        username: string;
        sort_by: string;
        projects_per_page: number;
        page: number;
        exclude_forks: boolean;
        exclude_archived: boolean;
        exclude_profile_repo: boolean;
        min_stars: number;
      }
    >({
      queryFn: async (args) => {
        const {
          username,
          sort_by,
          projects_per_page,
          page,
          exclude_forks,
          exclude_archived,
          exclude_profile_repo,
          min_stars,
        } = args;
        const url = `https://api.github.com/users/${username}/repos?sort=${sort_by}&per_page=${projects_per_page}&type=owner&page=${page}`;
        try {
          const response = await fetch(url);
          if (!response.ok)
            throw new Error(
              `GitHub API request failed: ${response.statusText}`,
            );
          const data: GitHubRepo[] = await response.json();
          const filtered = data.filter((p) => {
            if (exclude_forks && p.fork) return false;
            if (exclude_archived && p.archived) return false;
            if (exclude_profile_repo && p.name === username) return false;
            if (p.stargazers_count < min_stars) return false;
            return !p.private;
          });
          return { data: filtered };
        } catch (error: unknown) {
          return {
            error: {
              message: error instanceof Error ? error.message : "Unknown error",
              details: "",
              hint: "",
              code: "FETCH_ERROR",
            },
          };
        }
      },
    }),

    submitContactForm: builder.mutation<
      void,
      { name: string; email: string; subject: string; message: string }
    >({
      queryFn: async (formData) => {
        // Save to Supabase
        if (supabase) {
          const { error } = await supabase
            .from("contact_submissions")
            .insert(formData);
          if (error) return { error };
        }

        // Send Discord notification
        const webhookUrl =
          process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL || "";
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: "Portfolio Contact",
                avatar_url: "https://i.imgur.com/4M34hi2.png",
                embeds: [
                  {
                    title: "New Contact Form Submission",
                    color: 5814783,
                    fields: [
                      { name: "Name", value: formData.name, inline: true },
                      { name: "Email", value: formData.email, inline: true },
                      { name: "Subject", value: formData.subject },
                      { name: "Message", value: formData.message },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: "Contact Form" },
                  },
                ],
              }),
            });
          } catch {
            // Discord notification is best-effort
          }
        }

        return { data: undefined };
      },
    }),

    getLockdownStatus: builder.query<number, void>({
      queryFn: async () => {
        if (!supabase) return { data: 0 }; // Mock: Always normal
        const { data, error } = await supabase
          .from("security_settings")
          .select("lockdown_level")
          .single();
        if (error || !data) return { data: 0 };
        return { data: data.lockdown_level };
      },
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetSiteIdentityQuery,
  useGetNavLinksQuery,
  useGetPublishedBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useIncrementPostViewMutation,
  useSubmitContactFormMutation,
  useGetPublishedLifeUpdatesQuery,
  useGetSectionsByPathQuery,
  useGetGitHubReposQuery,
  useGetLockdownStatusQuery,
} = publicApi;