import Head from "next/head";
import { PropsWithChildren, useEffect, useState } from "react";
import Container from "./container";
import Header from "./header";
import Footer from "./footer";
import MobileHeader from "./mobile-header";
import { useGetLockdownStatusQuery, useGetSiteIdentityQuery } from "@/store/api/publicApi";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { supabase } from "@/supabase/client";
import portfolioConfig from "../../portfolio.config";

type LayoutProps = PropsWithChildren & {
  isAdmin?: boolean;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/default-og-image.png`;

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const { data: siteIdentity } = useGetSiteIdentityQuery();
  const { data: lockdownLevel = 0 } = useGetLockdownStatusQuery();

  const siteName = siteIdentity?.profile_data.name || portfolioConfig.name;
  const siteTitle = siteIdentity
    ? `${siteIdentity.profile_data.name} - ${siteIdentity.profile_data.title}`
    : `${portfolioConfig.name} - ${portfolioConfig.title}`;
  const siteDescription = siteIdentity?.profile_data.description || portfolioConfig.description;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setIsAuthenticated(false);
        setIsAuthChecking(false);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsAuthChecking(false);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    if (!isAdmin) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isAdmin]);

  const isLockdownActive = lockdownLevel >= 1;
  const shouldBlockAccess =
    isLockdownActive && !isAuthChecking && !isAuthenticated;

  if (!isAdmin && shouldBlockAccess) {
    return (
      <>
        <Head>
          <title>System Offline</title>
          <meta name="robots" content="noindex" />
        </Head>
        <MaintenanceScreen level={lockdownLevel} />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <Head>
          <title key="title">Admin Panel | {siteName}</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
        </Head>
        <div className="font-sans bg-background min-h-[100dvh]">{children}</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Default OG tags — pages override via PageSEO */}
        <meta property="og:type" key="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" key="og:title" content={siteTitle} />
        <meta property="og:description" key="og:description" content={siteDescription} />
        <meta property="og:image" key="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:url" key="og:url" content={SITE_URL} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" key="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" key="twitter:title" content={siteTitle} />
        <meta name="twitter:description" key="twitter:description" content={siteDescription} />
        <meta name="twitter:image" key="twitter:image" content={DEFAULT_OG_IMAGE} />

        {/* Extra */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="author" content={siteName} />
      </Head>

      <div className="relative flex min-h-[100dvh] flex-col justify-between font-sans bg-background">
        {/* Grid Background */}
        <div className="fixed inset-0 bg-grid-pattern" />

        {/* Top gradient fade for depth */}
        <div
          className="pointer-events-none fixed inset-0 z-[-1]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.08), transparent)",
          }}
        />

        {/* Interactive Mouse Glow */}
        <div
          className="pointer-events-none fixed inset-0 z-[-1] opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.04), transparent 50%)`,
          }}
        />

        <Header />
        <MobileHeader />

        <main className="mt-20 w-full grow md:mt-24 relative z-10 flex flex-col">
          <Container className="flex-grow">{children}</Container>
        </main>

        <Footer />
      </div>
    </>
  );
}