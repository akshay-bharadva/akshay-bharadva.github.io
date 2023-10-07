import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { BsArrowUpRight } from "react-icons/bs";
import ProjectCard from "./project-card";

type Props = PropsWithChildren;

const USERNAME = `akshay-bharadva`;
const URL = `https://api.github.com/users/${USERNAME}/repos`;

export default function Projects({ children }: Props) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        const projects = data
          .filter((p: any) => !p.private)
          .filter((p: any) => p.language)
          .filter((p: any) => !p.fork)
          .filter((p: any) => !p.archived)
          .filter((p: any) => !p.name.includes(USERNAME))
          .sort(
            (a: any, b: any) =>
              new Date(b.updated_at ?? Number.POSITIVE_INFINITY).getTime() -
              new Date(a.updated_at ?? Number.POSITIVE_INFINITY).getTime()
          )
          .sort(
            (a: any, b: any) => a.description?.length - b.description?.length
          );
        setProjects(projects);
        setLoading(false);
      });
  }, []);

  return (
    <section className="my-8">
      <h2 className="text-3xl font-bold text-white font-space mb-4">
        Projects
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 mb-10">
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <p className="mb-2 font-space text-center">
            Show some <span title="love">❤️</span> by starring the{" "}
            <Link
              href={"https://github.com/akshay-bharadva?tab=repositories"}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="text-primary-400 hover:text-primary-600"
            >
              repository.&nbsp;
              <BsArrowUpRight className="inline" />
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
