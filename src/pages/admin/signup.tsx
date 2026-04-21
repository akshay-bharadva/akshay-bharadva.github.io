import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout";
import Head from "next/head";
import { useCheckAdminExistsQuery, adminApi } from "@/store/api/adminApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch } from "@/store/hooks";

export default function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: adminExists, isLoading: isChecking } = useCheckAdminExistsQuery();

  useEffect(() => {
    // FIX: Only redirect if we haven't just successfully signed up.
    // This allows the success message to stay on screen.
    if (!isChecking && adminExists && !success) {
      router.replace("/admin/login");
    }
  }, [adminExists, isChecking, router, success]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setIsLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setIsLoading(false);
      setError(signUpError.message);
      return;
    }

    // Mark success FIRST so the useEffect above doesn't redirect
    setSuccess(true);
    setIsLoading(false);

    // Invalidate cache so subsequent checks (like on the login page) are fresh
    dispatch(adminApi.util.invalidateTags(["System"]));
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Allow rendering if success is true, even if adminExists becomes true in the background
  if ((isChecking || adminExists) && !success) return null;

  return (
    <Layout isAdmin>
      <Head>
        <title>Setup Admin | Portfolio</title>
      </Head>
      <motion.div
        key="signup-page"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex min-h-screen items-center justify-center bg-grid-pattern px-4"
      >
        <div className="w-full max-w-sm space-y-8 rounded-lg bg-blueprint-bg p-8 border border-primary/20 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <ShieldPlus className="size-7 text-primary" />
            </div>
            <h2 className="font-mono text-2xl font-bold text-foreground">
              Initialize System
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {success 
                ? "Setup complete." 
                : "No administrator detected. Create the root account to take control."
              }
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex flex-col items-center gap-3">
                 <CheckCircle2 className="size-10 text-green-500" />
                 <div>
                   <h3 className="font-bold text-green-500">Account Created</h3>
                   <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                     A confirmation link has been sent to <strong>{email}</strong>.
                     <br/><br/>
                     Please verify your email address to activate the admin account, then proceed to login.
                   </p>
                 </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => router.push('/admin/login')}
              >
                Go to Login
              </Button>
            </motion.div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSignup}>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Secure Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Must be at least 6 characters.</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold">Registration Failed</AlertTitle>
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  "Create Owner Account"
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </Layout>
  );
}