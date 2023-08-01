import Link from "next/link";
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren & {
  project: any;
};

export default function ProjectCard({ children, project }: Props) {
  return (
    <div
      className="group border border-gray-700 rounded-lg hover:shadow-md hover:border-gray-100 transform hover:-translate-y-1 transition-all duration-200"
      key={project.id}
    >
      <div className="m-3">
        {/* project.clone_url */}
        <h2 className="text-lg mb-2 font-space capitalize group-hover:text-primary-600 transition">
          {project.name.replaceAll("-", " ")}
          &nbsp;
          <Link
            className="cursor-pointer"
            href={project.html_url}
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <BsArrowUpRight className="inline" />
          </Link>
        </h2>
        <p className="font-light font-space text-sm text-slate-300 hover:text-slate-50 transition-all duration-200 mb-1 line-clamp-3 text-ellipsis">
          {project.description}
        </p>
        {/* <div className="flex flex-shrink flex-wrap">
          {project.topics.map((topic: string) => (
            <small
              key={topic}
              className="font-space flex-inline rounded-full bg-slate-400/20 px-2 py-0.5 text-xs mx-0.5 my-1"
            >
              {topic}
            </small>
          ))}
        </div> */}
        <div className="flex flex-shrink flex-wrap">
          <small className="font-space flex-inline rounded-full bg-slate-400/20 px-2 py-0.5 text-xs mx-0.5 my-1">
            {project.language}
          </small>
        </div>
      </div>
    </div>
  );
}
