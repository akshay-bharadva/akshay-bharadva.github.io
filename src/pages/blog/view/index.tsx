import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { BlogPost, SiteContent } from "@/types";
import Link from "next/link";
import PageSEO from "@/components/public/PageSEO";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig, isSupabaseConfigured } from "@/lib/config";
import { cn, formatDate, calculateReadTime } from "@/lib/utils";
import {
  Eye,
  Clock,
  Linkedin,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import NotFoundComponent from "@/components/not-found";
import { BsTwitterX } from "react-icons/bs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useGetBlogPostBySlugQuery,
  useIncrementPostViewMutation,
  useGetSiteIdentityQuery,
} from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import { TableOfContents } from "@/components/table-of-contents";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- COMPONENTS ---

const PostBreadcrumb = ({ post }: { post: BlogPost }) => (
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <li>
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
      </li>
      <li>
        <ChevronRight className="size-4" />
      </li>
      <li className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
        {post.title}
      </li>
    </ol>
  </nav>
);

const PostMeta = ({
  post,
  readTime,
  siteContent,
}: {
  post: BlogPost;
  readTime: number;
  siteContent: SiteContent | null;
}) => {
  const authorName = siteContent?.profile_data.name || appConfig.site.author;
  const authorImage = siteContent?.profile_data.profile_picture_url;
  const showImage = siteContent?.profile_data.show_profile_picture;

  return (
    <div className="flex items-center gap-3">
      {showImage && authorImage && (
        <Avatar className="size-10 border border-border">
          <AvatarImage src={authorImage} alt={authorName} />
          <AvatarFallback>
            {authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="text-sm leading-tight">
        <p className="font-medium text-foreground">{authorName}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
          <time
            dateTime={new Date(
              post.published_at || post.created_at || "",
            ).toISOString()}
          >
            {formatDate(post.published_at || post.created_at || new Date())}
          </time>
          <span className="hidden sm:inline">•</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </div>
  );
};

const PostContent = ({ content }: { content: string }) => (
  <div
    className="prose max-w-none dark:prose-invert
    prose-headings:scroll-mt-24 prose-headings:text-foreground
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
    prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border
    prose-img:rounded-xl prose-img:border prose-img:border-border"
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypePrism, rehypeSlug]}
      components={{
        a: (props) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const PostFooter = ({
  post,
  onShareX,
  onShareLinkedIn,
}: {
  post: BlogPost;
  onShareX: () => void;
  onShareLinkedIn: () => void;
}) => (
  <footer className="mt-16 pt-8 border-t border-border">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
            >
              <Badge
                variant="secondary"
                className="hover:bg-secondary/80 transition-colors px-3 py-1 text-sm font-normal"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Share:
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={onShareX}
          className="rounded-full size-9"
        >
          <BsTwitterX className="size-4" />
          <span className="sr-only">Share on X</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onShareLinkedIn}
          className="rounded-full size-9"
        >
          <Linkedin className="size-4" />
          <span className="sr-only">Share on LinkedIn</span>
        </Button>
      </div>
    </div>
  </footer>
);

const BlogPostSkeleton = () => (
  <div className="mx-auto max-w-5xl px-4 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 lg:col-start-1">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-[250px] sm:h-[400px] w-full rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  </div>
);

export default function BlogPostViewPage() {
  const router = useRouter();
  const { slug } = router.query;
  const isMobile = useIsMobile();
  const [isTocSheetOpen, setIsTocSheetOpen] = useState(false);

  const {
    data: post,
    isLoading: isPostLoading,
    isError,
  } = useGetBlogPostBySlugQuery(slug as string, {
    skip: !router.isReady || !slug,
  });

  const { data: siteContent, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();
  const [incrementView] = useIncrementPostViewMutation();
  const { site: siteConfig } = appConfig;

  useEffect(() => {
    if (post?.id && process.env.NODE_ENV === "production" && isSupabaseConfigured) {
      const timer = setTimeout(() => {
        incrementView(post.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [post?.id, incrementView]);

  const isLoading = isPostLoading || isContentLoading || !router.isReady;

  if (isLoading) {
    return (
      <Layout>
        <BlogPostSkeleton />
      </Layout>
    );
  }

  if (isError || !post) {
    return (
      <Layout>
        <NotFoundComponent />
      </Layout>
    );
  }

  const postUrl = `${siteConfig.url}/blog/view?slug=${post.slug}`;
  const metaDescription =
    post.excerpt ||
    post.content?.substring(0, 160).replace(/\n/g, " ") ||
    post.title;
  const readTime = calculateReadTime(post.content || "");

  const shareOnX = () =>
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out this article: ${post.title}`)}&url=${encodeURIComponent(postUrl)}`,
      "_blank",
    );
  const shareOnLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      "_blank",
    );

  return (
    <Layout>
      <PageSEO
        title={`${post.title} | ${siteContent?.profile_data.name || siteConfig.title}`}
        description={metaDescription}
        url={postUrl}
        ogImage={post.cover_image_url || siteConfig.defaultOgImage}
        ogTitle={post.title}
        ogType="article"
        articlePublishedTime={post.published_at || undefined}
        twitterCard="summary_large_image"
        twitterTitle={post.title}
        twitterDescription={metaDescription}
        twitterImage={post.cover_image_url || siteConfig.defaultOgImage}
      />
      <main className="py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 max-w-7xl"
        >
          <div
            className={cn(
              "grid grid-cols-1 gap-x-12",
              post.show_toc && "lg:grid-cols-12",
            )}
          >
            <article
              className={cn(
                "w-full max-w-3xl mx-auto",
                post.show_toc && "lg:col-span-8 lg:max-w-none",
              )}
            >
              <PostBreadcrumb post={post} />

              <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:leading-[1.1]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {post.excerpt}
                </p>
              )}

              <div className="my-6 flex flex-wrap items-center gap-4">
                <PostMeta
                  post={post}
                  readTime={readTime}
                  siteContent={siteContent || null}
                />
                {/* Mobile TOC Trigger */}
                {isMobile && post.show_toc && post.content && (
                  <Sheet open={isTocSheetOpen} onOpenChange={setIsTocSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <List className="size-4" /> On this page
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-lg w-full flex flex-col">
                      <div className="flex justify-between items-center">
                        <SheetHeader>
                          <SheetTitle>Table of Contents</SheetTitle>
                        </SheetHeader>
                        <SheetClose asChild>
                          <Button type="button" variant="ghost">
                            <X />
                          </Button>
                        </SheetClose>
                      </div>
                      <ScrollArea className="h-[85vh]">
                        <TableOfContents
                          content={post.content}
                          onLinkClick={() => setIsTocSheetOpen(false)}
                        />
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                )}
              </div>

              {post.cover_image_url && (
                <div className="mb-10 overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              )}

              <PostContent content={post.content || ""} />
              <PostFooter
                post={post}
                onShareX={shareOnX}
                onShareLinkedIn={shareOnLinkedIn}
              />
            </article>

            {/* Desktop TOC Sidebar */}
            {!isMobile && post.show_toc && (
              <aside className="lg:col-span-4 hidden lg:block">
                <div className="sticky top-28 space-y-8">
                  {post.content && (
                    <div className="p-1">
                      <TableOfContents content={post.content} />
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}