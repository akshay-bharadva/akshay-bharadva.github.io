import Layout from "@/components/layout";
import ProjectsComponent from "@/components/projects";
import FeaturedProject from "@/components/case-study-card";
import { config as appConfig } from "@/lib/config";
import PageSEO from "@/components/public/PageSEO";
import { siteContent } from "@/lib/site-content";
import PageWrapper from "@/components/public/PageWrapper";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "@/lib/animation-variants";
import { Loader2, AlertTriangle, FolderKanban } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetSectionsByPathQuery, useGetSiteIdentityQuery } from "@/store/api/publicApi";

export default function ProjectsPage() {
  const { site: siteConfig } = appConfig;
  const { data: siteIdentity } = useGetSiteIdentityQuery();
  const content = siteContent.pages.projects;
  const siteName = siteIdentity?.profile_data.name || siteConfig.title;
  const pageTitle = `${content.title} | ${siteName}`;
  const pageUrl = `${siteConfig.url}/projects/`;

  // Fetch all sections for the '/projects' page path
  const {
    data: sections,
    isLoading,
    error,
  } = useGetSectionsByPathQuery("/projects");

  // Find the specific "Featured Projects" section from the fetched data
  const featuredSection = sections?.find(
    (s) => s.title === "Featured Projects",
  );

  const hasFeaturedProjects =
    featuredSection?.portfolio_items &&
    featuredSection.portfolio_items.length > 0;

  return (
    <Layout>
      <PageSEO
        title={pageTitle}
        description={content.description}
        url={pageUrl}
        ogImage={siteConfig.defaultOgImage}
      />

      <PageWrapper maxWidth="wide">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {hasFeaturedProjects && (
            <motion.header variants={fadeSlideUp} className="mb-16 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
                <FolderKanban className="size-4" />
                <span>Projects</span>
              </div>
              <h1 className="font-display text-5xl font-black tracking-tighter text-foreground md:text-6xl">
                Featured Work<span className="text-primary">.</span>
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                A curated showcase of my proudest work and technical deep-dives.
              </p>
            </motion.header>
          )}

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!!error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto my-16">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Projects</AlertTitle>
              <AlertDescription>
                {error && typeof error === "object" && "message" in error
                  ? String((error as { message: unknown }).message)
                  : "An unknown error occurred."}
              </AlertDescription>
            </Alert>
          )}

          {hasFeaturedProjects && (
            <motion.div variants={fadeSlideUp} className="mx-auto max-w-6xl space-y-24">
              {featuredSection.portfolio_items!.map((project, index) => (
                <FeaturedProject
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))}
            </motion.div>
          )}

          {hasFeaturedProjects && (
            <div className="my-24">
              <Separator />
            </div>
          )}

          <motion.div variants={fadeSlideUp}>
            <ProjectsComponent showTitle={true} />
          </motion.div>
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}