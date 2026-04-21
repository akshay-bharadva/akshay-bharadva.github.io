import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/layout";
import DynamicPageContent from "@/components/DynamicPageContent";
import { config as appConfig, isSupabaseConfigured } from "@/lib/config";
import { supabase } from "@/supabase/client";
import { MOCK_NAV_LINKS } from "@/lib/fallback-data";
import { Loader2 } from "lucide-react";

// Standard pages that already exist in /src/pages and shouldn't be handled here
const HARDCODED_PAGES = [
  "admin",
  "blog",
  "projects",
  "about",
  "contact",
  "showcase",
  "experience",
  "updates",
  "ui",
  "404",
  "500",
];

interface DynamicPageProps {
  pageTitle: string;
  pagePath: string;
}

export default function DynamicPage({ pageTitle, pagePath }: DynamicPageProps) {
  const router = useRouter();
  const { site: siteConfig } = appConfig;

  // If the page is still generating during build/fallback
  if (router.isFallback) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const title = `${pageTitle} | ${siteConfig.title}`;

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
              {pageTitle}
            </h1>
          </header>

          <DynamicPageContent pagePath={pagePath} />
        </div>
      </main>
    </Layout>
  );
}

// 1. Tell Next.js which paths to generate at build time
export const getStaticPaths: GetStaticPaths = async () => {
  let paths: { params: { slug: string[] } }[] = [];

  if (isSupabaseConfigured && supabase) {
    // Fetch all navigation links from DB
    const { data: links } = await supabase
      .from("navigation_links")
      .select("href")
      .eq("is_visible", true);

    if (links) {
      paths = links
        .filter((link) => {
          // Remove leading slash for splitting
          const cleanPath = link.href.replace(/^\//, "");
          const rootSegment = cleanPath.split("/")[0];
          // Filter out root "/" and hardcoded pages
          return link.href !== "/" && !HARDCODED_PAGES.includes(rootSegment);
        })
        .map((link) => ({
          params: {
            slug: link.href.replace(/^\//, "").split("/"),
          },
        }));
    }
  } else {
    // Mock Data Fallback
    paths = MOCK_NAV_LINKS.filter((link) => {
      const cleanPath = link.href.replace(/^\//, "");
      const rootSegment = cleanPath.split("/")[0];
      return link.href !== "/" && !HARDCODED_PAGES.includes(rootSegment);
    }).map((link) => ({
      params: {
        slug: link.href.replace(/^\//, "").split("/"),
      },
    }));
  }

  return {
    paths,
    fallback: false, // Return 404 for paths not found at build time (required for 'output: export')
  };
};

// 2. Fetch data for the specific path
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slugArray = params?.slug as string[];
  const pagePath = `/${slugArray.join("/")}`;
  let pageTitle = slugArray[slugArray.length - 1]; // Default title is the slug (e.g. "hello")

  // Try to find the pretty label from DB/Mock
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("navigation_links")
      .select("label")
      .eq("href", pagePath)
      .single();

    if (data) pageTitle = data.label;
  } else {
    const mockLink = MOCK_NAV_LINKS.find((l) => l.href === pagePath);
    if (mockLink) pageTitle = mockLink.label;
  }

  // Capitalize if we couldn't find a label
  if (!pageTitle || pageTitle === pagePath) {
    pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
  }

  return {
    props: {
      pageTitle,
      pagePath,
    },
  };
};