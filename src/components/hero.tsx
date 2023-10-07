import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function Hero({ children }: Props) {
  return (
    <section>
      <div className="flex gap-10 items-center justify-between">
        <div className="">
          {/* 
          <h2 className="text-3xl font-bold text-white font-space mb-4">
            Akshay Bharadva <small className="text-sm">(He/Him)</small>
          </h2>
           */}
          <p className="font-space mb-2">
            Heya! I&apos;m fullstack developer and life-long learner,from India, living in
            ON, Canada. I enjoy learning new technologies and collaborating with
            other developers to make products a reality. I also enjoy
            open-source, and despite having a full-time job, I devote time to
            exploring open-source projects and studying their tech stack and
            coding conventions.
          </p>
          <p className="font-space">
            Fun but sad fact: I often misspelled the return keyword. i.e,{" "}
            <span className="text-primary-400">&ldquo;reutrn&rdquo;</span>. let me
            know if you have any trick so that I can avoid this mistake.(P.S. thanks to linter for preventing me to broke pipeline of the deployment 😅)
          </p>
        </div>
      </div>
    </section>
  );
}
