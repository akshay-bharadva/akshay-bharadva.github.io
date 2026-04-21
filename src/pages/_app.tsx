
import "@/styles/globals.css";
import "prism-themes/themes/prism-one-dark.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { LearningSessionManager } from "@/components/LearningSessionManager";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import Head from "next/head";
import React, { useEffect } from "react";
import { hexToHsl } from "@/lib/utils";
import { config as appConfig } from "@/lib/config";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { ConfirmDialogProvider } from "@/components/providers/ConfirmDialogProvider";
import GlobalCommandPalette from "@/components/GlobalCommandPalette";

const tahuFont = localFont({
  src: "./fonts/Tahu.woff2",
  variable: "--font-tahu",
  display: "swap",
});

const VALID_THEMES = [
  "theme-blueprint",
  "theme-dracula",
  "theme-nord",
  "theme-tokyo-night",
  "theme-catppuccin-mocha",
  "theme-github-dark",
  "theme-onedark-pro",
  "theme-rose-pine",
  "theme-monokai",
  "theme-ayu-dark",
  "theme-solarized-light",
  "theme-catppuccin-latte",
  "theme-github-light",
  "theme-arctic",
  "theme-paper",
  "theme-cyberpunk",
  "theme-ocean",
  "theme-matrix",
  "theme-hc-dark",
  "theme-hc-light",
  "theme-neobrutalism-light",
  "theme-neobrutalism-dark",
  "theme-neobrutalism-punk",
  "theme-glass-dark",
  "theme-glass-frost",
  "theme-glass-aurora",
  "theme-glass-ocean",
  "theme-synthwave",
  "theme-retrowave",
  "theme-terminal",
  "theme-custom",
];

function ThemedApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

  const { data: siteIdentity } = useGetSiteIdentityQuery();

  // Get theme from DB
  const dbTheme = siteIdentity?.profile_data?.default_theme;
  const finalTheme = dbTheme?.startsWith("theme-")
    ? dbTheme
    : `theme-${dbTheme || "blueprint"}`;

  // Get typography preset from DB
  const typographyPreset =
    siteIdentity?.profile_data?.typography_preset || "typo-default";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    if (siteIdentity) {
      // Clean up standard themes and typography presets
      const TYPO_CLASSES = [
        "typo-default",
        "typo-editorial",
        "typo-modern-tech",
        "typo-elegant",
        "typo-bold-quirky",
        "typo-futuristic",
        "typo-classic-pro",
        "typo-geometric",
      ];
      html.classList.remove(...VALID_THEMES, ...TYPO_CLASSES, "dark", "light");

      if (
        finalTheme === "theme-custom" &&
        siteIdentity.profile_data.custom_theme_colors
      ) {
        const colors = siteIdentity.profile_data.custom_theme_colors;
        const root = document.documentElement;

        const setStyle = (name: string, hex: string) => {
          root.style.setProperty(`--${name}`, hexToHsl(hex));
        };

        setStyle("background", colors.background);
        setStyle("foreground", colors.foreground);
        setStyle("primary", colors.primary);
        setStyle("primary-foreground", colors.background);
        setStyle("secondary", colors.secondary);
        setStyle("secondary-foreground", colors.foreground);
        setStyle("accent", colors.accent);
        setStyle("accent-foreground", colors.background);
        setStyle("card", colors.card);
        setStyle("card-foreground", colors.foreground);
        setStyle("popover", colors.background);
        setStyle("popover-foreground", colors.foreground);
        setStyle("muted", colors.secondary);
        setStyle("muted-foreground", colors.foreground);
        setStyle("destructive", "#ef4444");
        setStyle("destructive-foreground", colors.foreground);
        setStyle("border", colors.secondary);
        setStyle("input", colors.secondary);
        setStyle("ring", colors.primary);
      } else {
        const root = document.documentElement;
        [
          "background",
          "foreground",
          "primary",
          "primary-foreground",
          "secondary",
          "secondary-foreground",
          "accent",
          "accent-foreground",
          "card",
          "card-foreground",
          "popover",
          "popover-foreground",
          "muted",
          "muted-foreground",
          "destructive",
          "destructive-foreground",
          "border",
          "input",
          "ring",
        ].forEach((k) => {
          root.style.removeProperty(`--${k}`);
        });
      }

      html.classList.add(finalTheme);
      if (typographyPreset && typographyPreset !== "typo-default") {
        html.classList.add(typographyPreset);
      }
      localStorage.setItem("site-theme", finalTheme);
    }
  }, [isAdminPage, siteIdentity, finalTheme, typographyPreset]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  const defaultTitle = siteIdentity
    ? `${siteIdentity.profile_data.name} | ${siteIdentity.profile_data.title}`
    : appConfig.site.title;

  return (
    <main className={`${tahuFont.variable}`}>
      <Head>
        <title key="title">{defaultTitle}</title>
      </Head>
      <LearningSessionManager />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.asPath}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="w-full"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <GlobalCommandPalette />
      <SonnerToaster />
      <ShadcnToaster />
    </main>
  );
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="theme-blueprint"
        enableSystem={false}
        storageKey="site-theme"
        themes={VALID_THEMES}
      >
        <ConfirmDialogProvider>
          <ThemedApp {...props} />
        </ConfirmDialogProvider>
      </ThemeProvider>
    </Provider>
  );
}
