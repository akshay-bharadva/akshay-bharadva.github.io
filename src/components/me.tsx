import Image from "next/image";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function Me({ children }: Props) {
  return (
    <section>
      <div className="flex flex-col gap-5 items-center justify-center w-full h-full mb-10">
        <div className="flex gap-5 items-center">
          <Image
            src={"https://avatars.githubusercontent.com/u/52954931?v=4"}
            alt="akshay-bharadva"
            className="w-32 rounded-full"
          />
          <h2 className="text-5xl text-white font-tahu mb-4 -rotate-12 line-clamp-5">
            Akshay
            <br />
            Bharadva
          </h2>
        </div>
      </div>
    </section>
  );
}
