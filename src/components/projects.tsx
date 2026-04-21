import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, AlertTriangle, Github, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { skipToken } from "@reduxjs/toolkit/query";

import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useGetGitHubReposQuery,
  useGetSiteIdentityQuery,
} from "@/store/api/publicApi";

type ProjectsProps = { showTitle?: boolean };

const FETCH_BATCH_SIZE = 100;

export default function Projects({ showTitle = true }: ProjectsProps) {
  const { data: content, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();
  const config = content?.profile_data.github_projects_config;
  const displayStep = config?.projects_per_page ?? 9;

  const queryArg = useMemo(
    () =>
      config?.show && config.username
        ? {
            username: config.username,
            sort_by: config.sort_by,
            projects_per_page: FETCH_BATCH_SIZE,
            page: 1,
            exclude_forks: config.exclude_forks,
            exclude_archived: config.exclude_archived,
            exclude_profile_repo: config.exclude_profile_repo,
            min_stars: config.min_stars,
          }
        : skipToken,
    [config],
  );

  const { data, error, isLoading } = useGetGitHubReposQuery(queryArg);
  const [visibleCount, setVisibleCount] = useState(displayStep);

  useEffect(() => {
    setVisibleCount(displayStep);
  }, [displayStep, data]);

  if (!isContentLoading && !config?.show) return null;

  const allRepos = data ?? [];
  const visibleRepos = allRepos.slice(0, visibleCount);
  const hasMore = visibleCount < allRepos.length;
  const initialLoading = isContentLoading || isLoading;

  const errorMessage =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "Could not load projects at this time.";

  const githubProfileUrl = config?.username
    ? `https://github.com/${config.username}?tab=repositories`
    : "https://github.com";

  return (
    <section>
      {showTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative mb-16 text-center"
        >
          <h1 className="text-5xl font-black text-foreground md:text-6xl">
            My Projects
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A selection of my open-source work from GitHub.
          </p>
        </motion.div>
      )}

      {initialLoading && (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading projects from GitHub…</span>
        </div>
      )}

      {!initialLoading && !!error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Couldn&apos;t load projects</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!initialLoading && !error && allRepos.length === 0 && (
        <div className="py-16 text-center">
          <Github className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No public projects found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing matches the current filters — check{" "}
            <a
              href={githubProfileUrl}
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            directly.
          </p>
        </div>
      )}

      {!initialLoading && !error && visibleRepos.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: (index % displayStep) * 0.04,
                }}
              >
                <ProjectCard project={repo} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            {hasMore ? (
              <Button
                onClick={() =>
                  setVisibleCount((c) =>
                    Math.min(c + displayStep, allRepos.length),
                  )
                }
                size="lg"
              >
                Load More Projects
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="group">
                <a
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View All on GitHub
                  <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
