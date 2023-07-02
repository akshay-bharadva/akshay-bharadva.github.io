import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

type Tech = {
  name: string;
  href: string;
  desc: string;
};

const Technologies: Tech[] = [
  {
    name: "React",
    href: "https://react.dev/",
    desc: "My go to library for SPA(single-page applications)",
  },
  {
    href: "https://redux-toolkit.js.org/",
    name: "Redux Toolkit",
    desc: "When state gets complex",
  },
  {
    href: "https://nextjs.org/",
    name: "Next.js",
    desc: "Learned for making server-side application and this website ;-)",
  },
  { href: "https://www.mysql.com/", name: "MySQL", desc: "Good old RDBMS" },
  {
    href: "https://www.prisma.io/",
    name: "Prisma",
    desc: "TypeScript ORM when working with databases",
  },
];

export default function Technology({ children }: Props) {
  return (
    <section className="my-8">
      <h2 className="text-3xl font-bold text-white font-space mb-4">
        Tech Stack
      </h2>
      <div>
        {Technologies.map((tech) => (
          <p className="mb-2 font-space" key={tech.href}>
            <a href={tech.href} rel="noreferrer" target="_blank" className="">
              <span>
                {tech.name} <BsArrowUpRight className="inline" />
              </span>
            </a>
            : {tech.desc}
          </p>
        ))}
        <p className="mb-2 font-space">and many more to get the work done.</p>
      </div>
    </section>
  );
}
