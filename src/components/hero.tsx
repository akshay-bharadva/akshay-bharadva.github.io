import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function Hero({ children }: Props) {
  return (
    <section>
      <div className="flex gap-10 items-center justify-between">
        <div className="">
          <h2 className="text-3xl font-bold text-white font-space">
            Akshay Bharadva <small className="text-sm">(He/Him)</small>
          </h2>
          <p className="font-space">Fullstack Developer based in India</p>
        </div>
      </div>
    </section>
  );
}
