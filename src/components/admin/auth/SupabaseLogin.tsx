
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useCheckAdminExistsQuery } from "@/store/api/adminApi"; // Import hook

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- NEW: Check Admin Status ---
  const { data: adminExists, isLoading: isCheckingAdmin } = useCheckAdminExistsQuery();

  useEffect(() => {
    // If check finishes and result is FALSE, redirect to setup
    if (!isCheckingAdmin && adminExists === false) {
      router.replace("/admin/signup");
    }
  }, [adminExists, isCheckingAdmin, router]);
  // -------------------------------

  useEffect(() => {
    if (!supabase) return;
    const redirectIfAuthenticated = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase!.auth.getSession();

      if (session) {
        const { data: aalData } =
          await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.currentLevel === "aal2") {
          router.replace("/admin");
        } else if (aalData?.nextLevel === "aal2") {
          router.replace("/admin/mfa-challenge");
        } else {
          router.replace("/admin/setup-mfa");
        }
      } else {
        setIsLoading(false);
      }
    };

    redirectIfAuthenticated();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Database connection missing. Cannot login.");
      return;
    }
    setIsLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      setIsLoading(false);
      setError(signInError.message || "Invalid login credentials.");
      return;
    }

    if (data.session) {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        setIsLoading(false);
        setError(aalError.message || "Could not verify MFA status.");
        return;
      }

      if (aalData.currentLevel === "aal2") {
        router.replace("/admin");
      } else if (
        aalData.currentLevel === "aal1" &&
        aalData.nextLevel === "aal2"
      ) {
        router.replace("/admin/mfa-challenge");
      } else {
        router.replace("/admin/setup-mfa");
      }
    } else {
      setIsLoading(false);
      setError("Login failed. Please try again.");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // While checking if admin exists, show loader to prevent form flash
  if (isCheckingAdmin && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grid-pattern">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      key="login-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-grid-pattern px-4"
    >
      <div className="w-full max-w-sm space-y-8 rounded-lg bg-blueprint-bg p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
            <Lock className="size-6 text-primary" />
          </div>
          <h2 className="font-mono text-3xl font-bold text-foreground">
            Admin Access
          </h2>
          <p className="mt-2 text-muted-foreground">
            Authenticate to access the command center.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter access key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3"
              >
                <p className="text-sm font-medium text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Authorize"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}