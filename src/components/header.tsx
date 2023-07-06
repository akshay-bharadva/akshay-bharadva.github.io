import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiFillGithub } from "react-icons/ai";

type Props = PropsWithChildren;

type LinkProps = {
  href: string;
  label: string;
};

const Links: LinkProps[] = [
  // {
  //   href: "/",
  //   label: "Home",
  // },
  // {
  //   href: "/experience",
  //   label: "Experience",
  // },
  // {
  //   href: "/projects",
  //   label: "Projects",
  // },
];

export default function Header({ children }: Props) {
  return (
    <header className="font-space py-8 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden sm:flex sm:flex-row sm:gap-x-4">
        {Links.map((link) => (
          <Link
            className="cursor-pointer mr-5 transform hover:-translate-y-0.5 hover:text-primary-600 transition-all duration-200 py-2"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-2">
        <Link
          className="mr-2 p-2 text-2xl text-white justify-center items-center gap-1 hover:bg-zinc-700 transition-all rounded-lg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="github-repo"
          href="https://github.com/akshay-bharadva"
        >
          <AiFillGithub />
        </Link>
      </div>
    </header>
  );
}
