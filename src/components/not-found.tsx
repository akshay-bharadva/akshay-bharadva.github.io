import Link from "next/link";
import { PropsWithChildren } from "react";
import { BsArrowUpRight } from "react-icons/bs";

type Props = PropsWithChildren;

export default function NotFound({ children }: Props) {
  return (
    <section className="my-8">
      <h2 className="text-3xl font-bold text-white font-space mb-4">
        <span className="text-primary-400">404</span> | Page not found
      </h2>
      <p className="mb-2 font-space">
        I&apos;m afraid that I haven&apos;t developed the page that you are
        looking for. :(
      </p>
      <p className="font-space">
        Back to&nbsp;
        <Link
          href={"/"}
          className="text-primary-400 hover:text-primary-600 transition"
        >
          <span>
            Pavilion <BsArrowUpRight className="inline" />
          </span>
        </Link>
      </p>
    </section>
  );
}
