import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiFillGithub } from "react-icons/ai";

type Props = PropsWithChildren;

type LinkProps = {
  href: string;
  label: string;
};

const Links: LinkProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/experience",
    label: "Experience",
  },
  // {
  //   href: "/projects",
  //   label: "Projects",
  // },
  {
    href: "/about",
    label: "About",
  },
];

export default function Header({ children }: Props) {
  return (
    <header className="font-space py-8 sm:flex sm:flex-row sm:items-center sm:justify-between fixed top-0 w-full left-0 z-50">
      <div className="hidden sm:flex sm:flex-row sm:gap-x-4 w-md mx-auto px-10 rounded-full shadow-sm backdrop-blur-sm bg-slate-300/10">
        {Links.map((link) => (
          <Link
            className="cursor-pointer mr-5 last-of-type:mr-0 transform hover:text-primary-600 hover:font-bold transition-all duration-200 py-2 text-sm"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
