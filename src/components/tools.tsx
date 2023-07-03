import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

type Tool = {
  name: string;
  href: string;
  desc: string;
};

const UsedTools: Tool[] = [
  {
    name: "Visual Studio Code",
    href: "https://code.visualstudio.com/",
    desc: "My All time favourite text editor with super powers.",
  },
  {
    name: "Figma",
    href: "https://www.figma.com/",
    desc: "Figma for turning UI/UX design into real Product",
  },
  {
    name: "GitHub",
    href: "https://github.com/",
    desc: "For versioning my code, transfer my code to remote and to share it with other devs",
  },
  {
    name: "Slack",
    href: "https://slack.com/intl/en-in/",
    desc: "Communication is must and also lots of Open-Source community is on it so to interact with maintainer and collaborate with devs",
  },
  {
    name: "Discord",
    href: "https://discord.com/",
    desc: "Initially joined to talked with Gamer, however later found awesome community.",
  },
];

export default function Tools({ children }: Props) {
  return (
    <section className="my-8">
      <h2 className="text-3xl font-bold text-white font-space mb-4">Tools</h2>
      <div>
        {UsedTools.map((tech) => (
          <p className="mb-2 font-space" key={tech.href}>
            <a
              href={tech.href}
              rel="noreferrer"
              target="_blank"
              className="text-red-400 hover:text-red-600 transition"
            >
              <span>
                {tech.name} <BsArrowUpRight className="inline" />
              </span>
            </a>
            : {tech.desc}
          </p>
        ))}
        <p className="mb-2 font-space">and many more.</p>
      </div>
    </section>
  );
}
