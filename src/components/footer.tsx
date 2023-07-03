import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiOutlineCopyrightCircle } from "react-icons/ai";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

export default function Footer({ children }: Props) {
  return (
    <footer className="my-8 flex flex-col justify-center gap-4 font-space items-center">
      <p className="flex flex-col justify-center items-center gap-2 md:block">
        <span className="">
          Built with{" "}
          <Link
            href="https://nextjs.org/"
            rel="noreferrer"
            target="_blank"
            className="text-red-400 hover:text-red-600 transition"
          >
            Next.js <BsArrowUpRight className="inline" />
          </Link>
        </span>
        <span className="hidden md:inline"> | </span>
        <span>
          View Source on{" "}
          <a
            href="https://github.com/akshay-bharadva/akshay-bharadva.github.io"
            rel="noreferrer"
            target="_blank"
            className="text-red-400 hover:text-red-600 transition"
          >
            <span>
              GitHub <BsArrowUpRight className="inline" />
            </span>
          </a>
        </span>
      </p>
      <p>
        Akshay Bharadva&nbsp;
        <AiOutlineCopyrightCircle className="inline-block" />
        &nbsp;
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
