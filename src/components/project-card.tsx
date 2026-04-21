import { ArrowUpRight, GitFork, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GitHubRepo } from "@/types";

type ProjectCardProps = { project: GitHubRepo };

export default function ProjectCard({ project }: ProjectCardProps) {
  const title = project.name; // .replaceAll("-", " ");
  const description = (project.description || "No description provided.")
    .split(/\\n\\n|\\n|\n/)
    .filter(Boolean)
    .join(" ");
  const topics = project.topics?.slice(0, 3) ?? [];
  const hasTags = Boolean(project.language) || topics.length > 0;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-bold tracking-tight">
            {project.html_url ? (
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </CardTitle>
          <ArrowUpRight className="size-4 flex-shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3.5" />
            {project.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3.5" />
            {project.forks_count}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pb-3">
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>

      {hasTags && (
        <CardFooter className="mt-auto flex flex-wrap gap-1.5 pt-0">
          {project.language && (
            <Badge
              variant="secondary"
              className="border-transparent bg-primary/10 font-mono text-[10px] text-primary"
            >
              {project.language}
            </Badge>
          )}
          {topics.map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className="border-border/50 text-[10px] text-muted-foreground"
            >
              {topic}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
