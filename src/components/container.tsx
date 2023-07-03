import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export default function Container({ children }: Props) {
  return (
    <div className="px-4 sm:px-8 md:px-24 lg:px-48 xl:px-72">{children}</div>
  );
}
