import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function LittleAboutMyself({ children }: Props) {
  return (
    <section>
      <div className="flex flex-col gap-5 items-center justify-center w-full h-full mb-10">
        <div className="flex flex-col gap-5 text-4xl">
          <p className="font-space text-slate-500">Heya,</p>
          <div className="flex gap-5 items-center">
            <p className="font-space text-slate-500 line-clamp-6">I&apos;m</p>
            <h2 className="text-7xl text-white font-tahu mb-4 line-clamp-7">
              Akshay Bharadva
            </h2>
          </div>
          <p className="font-space text-slate-500">Fullstack Developer.</p>
        </div>
      </div>
    </section>
  );
}
