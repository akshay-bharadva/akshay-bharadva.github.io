import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "./container";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetSiteIdentityQuery,
  useGetNavLinksQuery,
} from "@/store/api/publicApi";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/supabase/client";
import { ShieldCheck } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { data: content, isLoading: isContentLoading } =
    useGetSiteIdentityQuery();
  const { data: navLinks, isLoading: isNavLoading } = useGetNavLinksQuery();
  const isLoading = isContentLoading || isNavLoading;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return; // Mock Mode
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkUser();
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 hidden w-full border-b border-border/50 bg-background/80 py-4 backdrop-blur-md shadow-sm md:block">
      <Container>
        <div className="flex h-8 items-center justify-between">
          <Link
            href="/"
            className="group relative flex items-center font-heading text-xl font-bold tracking-tighter transition-opacity hover:opacity-80"
          >
            {isLoading || !content ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <>
                <span className="text-foreground">
                  {content.profile_data.logo.main}
                </span>
                <span className="text-primary font-bold font-black">
                  {content.profile_data.logo.highlight}
                </span>
              </>
            )}
          </Link>

          <nav className="flex items-center gap-1 rounded-full bg-secondary p-1 border border-border/50 shadow-sm">
            {isLoading ? (
              <div className="flex gap-4 px-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <>
                {navLinks?.map((link) => {
                  const isActive =
                    router.pathname === link.href ||
                    (link.href !== "/" &&
                      router.pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "relative z-0 px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            layoutId="header-pill"
                            className="absolute inset-0 z-[-1] rounded-full bg-primary shadow-sm will-change-transform"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                              opacity: { duration: 0.2 },
                            }}
                          />
                        )}
                      </AnimatePresence>
                      {link.label}
                    </Link>
                  );
                })}

                {isAuthenticated && (
                  <Link
                    href="/admin"
                    className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2"
                  >
                    <ShieldCheck className="size-3.5" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}