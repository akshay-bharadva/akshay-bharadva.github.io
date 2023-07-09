import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";

const tahu = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={tahu.variable}>
      <Component {...pageProps} />
    </main>
  );
}
