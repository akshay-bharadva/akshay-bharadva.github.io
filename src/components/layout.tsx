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
        <title>Akshay Bharadva | {title}</title>
      </Head>
      <Container>
        <Header />
      </Container>
      {children}
      <Container>
        <Footer />
      </Container>
    </>
  );
}
