import Head from "next/head";
import { PropsWithChildren } from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";

type Props = PropsWithChildren & {
  title: string;
};

export default function Layout({ children, title }: Props) {
  return (
    <>
      <Head>
        <title>Akshay Bharadva{title ? `| ${title}` : `Portfolio`}</title>
      </Head>
      <div className="flex flex-col justify-between min-h-screen selection:bg-[#fffba0] selection:text-black">
        <div>
          <Container>
            <Header />
          </Container>
          {children}
        </div>
        <Container>
          <Footer />
        </Container>
      </div>
    </>
  );
}
