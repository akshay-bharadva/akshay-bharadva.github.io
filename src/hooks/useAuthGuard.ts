import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, Session } from "@/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { toast } from "sonner";

export function useAuthGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1. Check if Supabase is even configured (Mock Mode)
    if (!isSupabaseConfigured || !supabase) {
      // If we are on an admin page, kick them out
      if (router.pathname.startsWith("/admin")) {
        // Prevent toast spam on initial load if redirecting immediately
        if (router.isReady) {
          toast.error("Admin Unavailable", {
            description: "Portfolio is running in Static Mode (No Database).",
          });
          router.replace("/");
        }
      }
      setIsLoading(false);
      return;
    }

    // 2. Standard Auth Check
    const checkAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase!.auth.getSession();

      if (!currentSession) {
        router.replace("/admin/login");
        return;
      }

      // Check MFA
      const { data: aalData } =
        await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel !== "aal2") {
        router.replace("/admin/login");
        return;
      }

      setSession(currentSession);
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === "SIGNED_OUT") {
          router.replace("/admin/login");
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  return { isLoading, session };
}