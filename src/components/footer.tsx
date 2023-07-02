import Link from "next/link";
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

export default function Footer({ children }: Props) {
  return (
    <footer className="my-8 flex flex-col justify-center gap-4 font-space items-center">
      <p>
        <span className="">
          Built with{" "}
          <Link
            href="https://nextjs.org/"
            rel="noreferrer"
            target="_blank"
            className=""
          >
            Next.js <BsArrowUpRight className="inline" />
          </Link>
        </span>
        <span className=""> | </span>
        <span>
          View Source on{" "}
          <a
            href="https://github.com/akshay-bharadva/akshay-bharadva.github.io"
            rel="noreferrer"
            target="_blank"
            className=""
          >
            <span>
              GitHub <BsArrowUpRight className="inline" />
            </span>
          </a>
        </span>
      </p>
      <p>{new Date().getFullYear()}</p>
    </footer>
  );
}
