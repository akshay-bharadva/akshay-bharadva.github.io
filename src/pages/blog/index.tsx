import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import PageSEO from "@/components/public/PageSEO";
import { formatDate, calculateReadTime } from "@/lib/utils";
import {
  Eye,
  Clock,
  Loader2,
  FileText,
  Search,
  X,
  CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetPublishedBlogPostsQuery, useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";



export default function BlogIndexPage() {
  const {
    data: posts = [],
    isLoading,
    error,
  } = useGetPublishedBlogPostsQuery();
  const { site: siteConfig } = appConfig;
  const { data: siteIdentity } = useGetSiteIdentityQuery();
  const siteName = siteIdentity?.profile_data.name || siteConfig.title;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt?.toLowerCase().includes(lowerQuery) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }, [posts, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <Layout>
      <PageSEO
        title={`Blog | ${siteName}`}
        description={`Articles and thoughts from ${siteConfig.author}.`}
        url={`${siteConfig.url}/blog/`}
        ogImage={siteConfig.defaultOgImage}
      />

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-foreground"
          >
            The Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl text-lg"
          >
            Thoughts, tutorials, and insights on software development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-md mt-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search posts..."
              className="pl-10 pr-10 h-11 bg-secondary/30 border-border/50 focus-visible:ring-primary/50 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-6 border rounded-xl p-4 bg-card/50"
              >
                <div className="space-y-4 flex-1 py-2 order-2 md:order-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-48 w-full md:w-64 md:h-40 rounded-lg shrink-0 order-1 md:order-2" />
              </div>
            ))}
          </div>
        ) : !!error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-destructive mb-2 font-medium">
              Failed to load posts.
            </p>
            <p className="text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/50 mb-4">
              <FileText className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No posts found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms.
            </p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-primary"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const readTime = calculateReadTime(post.content || "");
                const hasImage = !!post.cover_image_url;

                return (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    layout
                    className="w-full"
                  >
                    <Link
                      href={`/blog/view?slug=${post.slug}`}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                    >
                      <Card className="flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-card border-border/50">
                        {/* Content Section - Now First in DOM for flex layout, but visually flexible */}
                        <CardContent className="flex flex-col flex-1 p-5 md:p-8 justify-center order-2 md:order-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {post.tags?.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs font-normal bg-secondary/50 text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto md:ml-0">
                              <CalendarIcon className="size-3.5" />
                              <time
                                dateTime={
                                  post.published_at || post.created_at || ""
                                }
                              >
                                {formatDate(
                                  post.published_at || post.created_at,
                                )}
                              </time>
                            </div>
                          </div>

                          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary mb-3">
                            {post.title}
                          </h2>

                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt || "Read more about this topic..."}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mt-auto pt-2">
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-3.5" /> {readTime} min read
                            </span>
                            {typeof post.views === "number" && (
                              <span className="flex items-center gap-1.5">
                                <Eye className="size-3.5" /> {post.views} views
                              </span>
                            )}
                          </div>
                        </CardContent>

                        {hasImage ? (
                          <div className="w-full md:w-72 h-48 md:h-auto overflow-hidden bg-secondary relative shrink-0 order-1 md:order-2">
                            <img
                              src={post.cover_image_url!}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          // Optional placeholder to maintain layout balance
                          <div className="hidden md:flex w-24 shrink-0 bg-transparent order-2" />
                        )}
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </Layout>
  );
}