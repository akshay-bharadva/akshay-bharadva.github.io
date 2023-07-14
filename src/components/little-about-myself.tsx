import Link from "next/link";
import { PropsWithChildren } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BsGithub, BsLinkedin } from "react-icons/bs";

type Props = PropsWithChildren;

export default function LittleAboutMyself({ children }: Props) {
  return (
    <section>
      <div className="flex flex-col gap-5 items-center justify-center w-full h-full mb-10">
        <div className="flex flex-col gap-2 text-7xl mb-10">
          <p className="font-space text-slate-500">Heya,</p>
          <div className="flex gap-5 items-center">
            <p className="font-space text-slate-500 line-clamp-6">I&apos;m</p>
            <h2 className="text-7xl text-white font-space font-bold line-clamp-7">
              Akshay Bharadva
            </h2>
          </div>
          <p className="font-space text-slate-500">Fullstack Developer.</p>
        </div>
        <div className="flex gap-5">
          <Link
            className="mr-2 p-2 text-2xl text-white justify-center items-center gap-1 hover:bg-zinc-700 transition-all rounded-lg"
            href="https://github.com/akshay-bharadva"
            rel="noreferrer"
            target="_blank"
          >
            <BsGithub />
          </Link>
          <Link
            className="mr-2 p-2 text-2xl text-white justify-center items-center gap-1 hover:bg-zinc-700 transition-all rounded-lg"
            href="https://www.linkedin.com/in/akshay-bharadva/"
            rel="noreferrer"
            target="_blank"
          >
            <BsLinkedin />
          </Link>
          <Link
            className="mr-2 p-2 text-2xl text-white justify-center items-center gap-1 hover:bg-zinc-700 transition-all rounded-lg"
            href="mailto: akshaybharadva19@gmail.com"
            rel="noreferrer"
            target="_blank"
          >
            <AiOutlineMail />
          </Link>
        </div>
      </div>
    </section>
  );
}
