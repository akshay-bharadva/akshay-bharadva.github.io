import Layout from "@/components/layout";
import { config as appConfig } from "@/lib/config";
import PageSEO from "@/components/public/PageSEO";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DynamicPageContent from "@/components/DynamicPageContent";
import PageWrapper from "@/components/public/PageWrapper";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { User } from "lucide-react";

export default function AboutPage() {
  const { site: siteConfig } = appConfig;
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  const pageTitle = `About Me | ${content?.profile_data.name || siteConfig.title}`;
  const pageUrl = `${siteConfig.url}/about/`;
  const pageDescription =
    content?.profile_data.bio.join(" ") ||
    "Learn more about the developer behind the code.";

  return (
    <Layout>
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        ogImage={siteConfig.defaultOgImage}
      />
      <PageWrapper maxWidth="narrow">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.header variants={fadeSlideUp} className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
              <User className="size-4" />
              <span>About</span>
            </div>
            <h1 className="font-display text-5xl font-black tracking-tighter text-foreground md:text-6xl">
              About Me<span className="text-primary">.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A little more about who I am and what I do.
            </p>
          </motion.header>

          <motion.div
            variants={fadeSlideUp}
            className="flex flex-col items-center gap-8 sm:flex-row sm:items-start"
          >
            {isLoading || !content ? (
              <>
                <Skeleton className="size-32 shrink-0 rounded-full" />
                <div className="space-y-4 flex-1 w-full">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-11/12" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </>
            ) : (
              <>
                {content.profile_data.show_profile_picture && (
                  <Avatar className="size-28 shrink-0 border-2 border-border sm:size-32 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={content.profile_data.profile_picture_url}
                      alt={content.profile_data.name}
                    />
                    <AvatarFallback className="text-xl font-bold">
                      {content.profile_data.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className="prose prose-lg max-w-none text-center sm:text-left
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-headings:text-foreground
                  prose-strong:text-foreground
                  prose-a:text-primary hover:prose-a:text-primary/80"
                >
                  {content.profile_data.bio.map((paragraph, index) => (
                    <ReactMarkdown key={index}>{paragraph}</ReactMarkdown>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          <motion.div variants={fadeSlideUp} className="mt-16">
            <DynamicPageContent pagePath="/about" />
          </motion.div>
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}
