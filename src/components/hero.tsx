import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function Hero({ children }: Props) {
  return (
    <section>
      <div className="flex gap-10 items-center justify-between">
        <div className="">
          <h2 className="text-3xl font-bold text-white font-space mb-4">
            Akshay Bharadva <small className="text-sm">(He/Him)</small>
          </h2>
          <p className="font-space">
            Heya! I&apos;m fullstack developer and life-long learner, living in
            India. I love to learn new technologies and collaborate with other
            developers to code product into reality, btw I love open-source
            enthusiast. fun but sad fact: I often misspelled the return keyword
            i.e, <span className="text-red-400">&ldquo;reutrn&rdquo;</span>. let
            me know if you have any trick so that I can avoid this mistake.
          </p>
        </div>
      </div>
    </section>
  );
}
